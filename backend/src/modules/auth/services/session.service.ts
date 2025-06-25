import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '../../../common/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EventEmitter2 } from '@nestjs/event-emitter';

export interface Session {
  id: string;
  userId: string;
  deviceId: string;
  ipAddress: string;
  userAgent: string;
  lastActivity: Date;
  isActive: boolean;
  refreshToken: string;
  accessToken?: string; // Current access token
  role: string; // User role at session creation
  permissions: string[]; // User permissions at session creation
  createdAt: Date;
  expiresAt: Date;
  tokenRotationCount: number; // Track token rotations
  lastTokenRotation: Date;
}

@Injectable()
export class SessionService {
  private sessions: Map<string, Session> = new Map();
  private readonly MAX_SESSIONS_PER_USER = 3;
  private readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  private readonly TOKEN_ROTATION_LIMIT = 10; // Max token rotations per session
  private readonly CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes
  private readonly logger = new Logger(SessionService.name);

  constructor(
    private configService: ConfigService,
    private eventEmitter: EventEmitter2,
  ) {
    // Start cleanup interval
    this.startCleanupInterval();
  }

  async createSession(
    userId: string,
    deviceId: string,
    ipAddress: string,
    userAgent: string,
    refreshToken: string,
    accessToken: string,
    role: string,
    permissions: string[],
  ): Promise<Session> {
    // Check existing sessions for this user
    const existingSessions = this.getUserSessions(userId);

    // Enforce session limits
    if (existingSessions.length >= this.MAX_SESSIONS_PER_USER) {
      // Remove oldest session
      const oldestSession = existingSessions.sort(
        (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
      )[0];
      await this.removeSession(oldestSession.id);

      // Emit session limit exceeded event
      this.eventEmitter.emit('session.limit_exceeded', {
        userId,
        deviceId,
        ipAddress,
        timestamp: new Date(),
      });
    }

    const session: Session = {
      id: this.generateSessionId(),
      userId,
      deviceId,
      ipAddress,
      userAgent,
      lastActivity: new Date(),
      isActive: true,
      refreshToken,
      accessToken,
      role,
      permissions,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + this.SESSION_TIMEOUT),
      tokenRotationCount: 0,
      lastTokenRotation: new Date(),
    };

    this.sessions.set(session.id, session);

    // Emit session created event
    this.eventEmitter.emit('session.created', {
      sessionId: session.id,
      userId,
      deviceId,
      ipAddress,
      timestamp: new Date(),
    });

    this.logger.log(`Session created: ${session.id} for user: ${userId}`);
    return session;
  }

  async validateSession(sessionId: string, userId: string): Promise<boolean> {
    const session = this.sessions.get(sessionId);

    if (!session) {
      this.logger.warn(`Session not found: ${sessionId}`);
      return false;
    }

    // Check if session belongs to user
    if (session.userId !== userId) {
      this.logger.warn(
        `Session ${sessionId} does not belong to user ${userId}`,
      );
      await this.removeSession(sessionId);
      return false;
    }

    // Check if session is active
    if (!session.isActive) {
      this.logger.warn(`Session ${sessionId} is inactive`);
      return false;
    }

    // Check if session has expired
    if (new Date() > session.expiresAt) {
      this.logger.warn(`Session ${sessionId} has expired`);
      await this.removeSession(sessionId);
      return false;
    }

    // Check token rotation limit
    if (session.tokenRotationCount >= this.TOKEN_ROTATION_LIMIT) {
      this.logger.warn(`Session ${sessionId} exceeded token rotation limit`);
      await this.removeSession(sessionId);
      return false;
    }

    // Update last activity
    session.lastActivity = new Date();
    session.expiresAt = new Date(Date.now() + this.SESSION_TIMEOUT);

    return true;
  }

  async refreshSession(
    sessionId: string,
    newRefreshToken: string,
    newAccessToken: string,
    newRole?: string,
    newPermissions?: string[],
  ): Promise<Session | null> {
    const session = this.sessions.get(sessionId);

    if (!session || !session.isActive) {
      return null;
    }

    // Update tokens
    session.refreshToken = newRefreshToken;
    session.accessToken = newAccessToken;
    session.tokenRotationCount += 1;
    session.lastTokenRotation = new Date();
    session.lastActivity = new Date();
    session.expiresAt = new Date(Date.now() + this.SESSION_TIMEOUT);

    // Update role and permissions if provided
    if (newRole) {
      session.role = newRole;
    }
    if (newPermissions) {
      session.permissions = newPermissions;
    }

    // Emit token rotation event
    this.eventEmitter.emit('session.token_rotated', {
      sessionId,
      userId: session.userId,
      deviceId: session.deviceId,
      rotationCount: session.tokenRotationCount,
      timestamp: new Date(),
    });

    this.logger.log(
      `Session ${sessionId} tokens rotated (count: ${session.tokenRotationCount})`,
    );
    return session;
  }

  async invalidateSession(sessionId: string): Promise<boolean> {
    const session = this.sessions.get(sessionId);
    if (session) {
      // Emit session invalidated event
      this.eventEmitter.emit('session.invalidated', {
        sessionId,
        userId: session.userId,
        deviceId: session.deviceId,
        reason: 'manual_logout',
        timestamp: new Date(),
      });
    }

    const removed = this.removeSession(sessionId);
    if (removed) {
      this.logger.log(`Session ${sessionId} invalidated`);
    }
    return removed;
  }

  async invalidateAllUserSessions(
    userId: string,
    reason: string = 'force_logout',
  ): Promise<void> {
    const userSessions = this.getUserSessions(userId);

    for (const session of userSessions) {
      // Emit session invalidated event
      this.eventEmitter.emit('session.invalidated', {
        sessionId: session.id,
        userId: session.userId,
        deviceId: session.deviceId,
        reason,
        timestamp: new Date(),
      });

      this.removeSession(session.id);
    }

    this.logger.log(
      `All sessions invalidated for user ${userId} (reason: ${reason})`,
    );
  }

  async invalidateSessionsByDevice(
    userId: string,
    deviceId: string,
  ): Promise<void> {
    const userSessions = this.getUserSessions(userId);
    userSessions
      .filter((session) => session.deviceId === deviceId)
      .forEach((session) => {
        this.eventEmitter.emit('session.invalidated', {
          sessionId: session.id,
          userId: session.userId,
          deviceId: session.deviceId,
          reason: 'device_logout',
          timestamp: new Date(),
        });

        this.removeSession(session.id);
      });

    this.logger.log(
      `Device sessions invalidated for user ${userId}, device ${deviceId}`,
    );
  }

  async updateUserRoleInSessions(
    userId: string,
    newRole: string,
    newPermissions: string[],
  ): Promise<void> {
    const userSessions = this.getUserSessions(userId);

    for (const session of userSessions) {
      session.role = newRole;
      session.permissions = newPermissions;
      session.lastActivity = new Date();
    }

    this.logger.log(
      `Role updated in all sessions for user ${userId}: ${newRole}`,
    );
  }

  getUserSessions(userId: string): Session[] {
    return Array.from(this.sessions.values()).filter(
      (session) => session.userId === userId && session.isActive,
    );
  }

  getSession(sessionId: string): Session | undefined {
    return this.sessions.get(sessionId);
  }

  getActiveSessionsCount(): number {
    return Array.from(this.sessions.values()).filter(
      (session) => session.isActive,
    ).length;
  }

  getExpiredSessionsCount(): number {
    const now = new Date();
    return Array.from(this.sessions.values()).filter(
      (session) => now > session.expiresAt,
    ).length;
  }

  // Scheduled cleanup of expired sessions
  @Cron(CronExpression.EVERY_5_MINUTES)
  async scheduledCleanup(): Promise<void> {
    try {
      const beforeCount = this.sessions.size;
      this.cleanupExpiredSessions();
      const afterCount = this.sessions.size;
      const cleanedCount = beforeCount - afterCount;

      if (cleanedCount > 0) {
        this.logger.log(
          `Scheduled cleanup: removed ${cleanedCount} expired sessions`,
        );
      }
    } catch (error) {
      this.logger.error('Error during scheduled cleanup:', error);
    }
  }

  // Manual cleanup method
  cleanupExpiredSessions(): void {
    const now = new Date();
    const expiredSessions: string[] = [];

    for (const [sessionId, session] of this.sessions.entries()) {
      if (now > session.expiresAt) {
        expiredSessions.push(sessionId);
      }
    }

    // Remove expired sessions
    expiredSessions.forEach((sessionId) => {
      const session = this.sessions.get(sessionId);
      if (session) {
        this.eventEmitter.emit('session.expired', {
          sessionId,
          userId: session.userId,
          deviceId: session.deviceId,
          timestamp: new Date(),
        });
      }
      this.removeSession(sessionId);
    });
  }

  // Cleanup sessions with excessive token rotations
  cleanupExcessiveRotations(): void {
    const excessiveSessions: string[] = [];

    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.tokenRotationCount >= this.TOKEN_ROTATION_LIMIT) {
        excessiveSessions.push(sessionId);
      }
    }

    excessiveSessions.forEach((sessionId) => {
      const session = this.sessions.get(sessionId);
      if (session) {
        this.eventEmitter.emit('session.excessive_rotations', {
          sessionId,
          userId: session.userId,
          deviceId: session.deviceId,
          rotationCount: session.tokenRotationCount,
          timestamp: new Date(),
        });
      }
      this.removeSession(sessionId);
    });
  }

  // Get session statistics
  getSessionStats(): {
    total: number;
    active: number;
    expired: number;
    users: number;
    averageSessionsPerUser: number;
  } {
    const total = this.sessions.size;
    const active = this.getActiveSessionsCount();
    const expired = this.getExpiredSessionsCount();

    const uniqueUsers = new Set(
      Array.from(this.sessions.values()).map((session) => session.userId),
    ).size;

    const averageSessionsPerUser = uniqueUsers > 0 ? active / uniqueUsers : 0;

    return {
      total,
      active,
      expired,
      users: uniqueUsers,
      averageSessionsPerUser,
    };
  }

  private generateSessionId(): string {
    return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private removeSession(sessionId: string): boolean {
    return this.sessions.delete(sessionId);
  }

  private startCleanupInterval(): void {
    setInterval(() => {
      this.cleanupExpiredSessions();
      this.cleanupExcessiveRotations();
    }, this.CLEANUP_INTERVAL);
  }
}
