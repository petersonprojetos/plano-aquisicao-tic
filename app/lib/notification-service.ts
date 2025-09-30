import { prisma } from "@/lib/db";
import { NotificationType, Request, User } from "@prisma/client";

interface CreateNotificationParams {
  type: NotificationType;
  title: string;
  message: string;
  userId: string;
  requestId: string;
}

export const notificationService = {
  async createNotification({
    type,
    title,
    message,
    userId,
    requestId,
  }: CreateNotificationParams) {
    return await prisma.notification.create({
      data: {
        type,
        title,
        message,
        userId,
        requestId,
      },
    });
  },

  async createRequestNotifications(requestId: string) {
    const request = await prisma.request.findUnique({
      where: { id: requestId },
      include: {
        user: true,
        department: {
          include: {
            users: {
              where: {
                role: "MANAGER",
                isActive: true,
              },
            },
          },
        },
      },
    });

    if (!request) return;

    // Notificar gestores do departamento
    const managers = await prisma.user.findMany({
      where: {
        departmentId: request.departmentId,
        role: "MANAGER",
        isActive: true,
      },
    });

    for (const manager of managers) {
      await this.createNotification({
        type: "REQUEST_CREATED",
        title: "Nova Solicitação",
        message: `Nova solicitação ${request.requestNumber} criada no seu departamento`,
        userId: manager.id,
        requestId: request.id,
      });
    }
  },

  async createRequestApprovalNotifications(
    requestId: string,
    approverUserId: string,
    isManager: boolean
  ) {
    const request = await prisma.request.findUnique({
      where: { id: requestId },
      include: {
        user: true,
        department: true,
      },
    });

    if (!request) return;

    // Notificar o criador da solicitação
    await this.createNotification({
      type: "REQUEST_CREATED",
      title: "Solicitação Aprovada",
      message: `Sua solicitação ${request.requestNumber} foi aprovada por ${isManager ? "gestor" : "aprovador"}`,
      userId: request.userId,
      requestId: request.id,
    });

    // Se foi aprovada por gestor, notificar os aprovadores
    if (isManager) {
      const approvers = await prisma.user.findMany({
        where: {
          role: "APPROVER",
          isActive: true,
        },
      });

      for (const approver of approvers) {
        await this.createNotification({
          type: "REQUEST_CREATED",
          title: "Solicitação para Aprovação",
          message: `Nova solicitação ${request.requestNumber} do departamento ${request.department.name} aguardando aprovação`,
          userId: approver.id,
          requestId: request.id,
        });
      }
    }

    // Se foi aprovada por aprovador, notificar o gestor
    if (!isManager) {
      const managers = await prisma.user.findMany({
        where: {
          departmentId: request.departmentId,
          role: "MANAGER",
          isActive: true,
        },
      });

      for (const manager of managers) {
        await this.createNotification({
          type: "REQUEST_CREATED",
          title: "Solicitação Aprovada",
          message: `A solicitação ${request.requestNumber} foi aprovada pelo aprovador`,
          userId: manager.id,
          requestId: request.id,
        });
      }
    }
  },

  async createRequestReturnNotifications(
    requestId: string,
    returnedByUserId: string,
    isManager: boolean
  ) {
    const request = await prisma.request.findUnique({
      where: { id: requestId },
      include: {
        user: true,
        department: true,
      },
    });

    if (!request) return;

    // Notificar o criador da solicitação
    await this.createNotification({
      type: "REQUEST_CREATED",
      title: "Solicitação Devolvida",
      message: `Sua solicitação ${request.requestNumber} foi devolvida por ${isManager ? "gestor" : "aprovador"}`,
      userId: request.userId,
      requestId: request.id,
    });

    // Se foi devolvida por aprovador, notificar o gestor
    if (!isManager) {
      const managers = await prisma.user.findMany({
        where: {
          departmentId: request.departmentId,
          role: "MANAGER",
          isActive: true,
        },
      });

      for (const manager of managers) {
        await this.createNotification({
          type: "REQUEST_CREATED",
          title: "Solicitação Devolvida",
          message: `A solicitação ${request.requestNumber} foi devolvida pelo aprovador`,
          userId: manager.id,
          requestId: request.id,
        });
      }
    }
  },

  async createRequestDenialNotifications(
    requestId: string,
    deniedByUserId: string,
    isManager: boolean
  ) {
    const request = await prisma.request.findUnique({
      where: { id: requestId },
      include: {
        user: true,
        department: true,
      },
    });

    if (!request) return;

    // Notificar o criador da solicitação
    await this.createNotification({
      type: "REQUEST_CREATED",
      title: "Solicitação Negada",
      message: `Sua solicitação ${request.requestNumber} foi negada por ${isManager ? "gestor" : "aprovador"}`,
      userId: request.userId,
      requestId: request.id,
    });

    // Se foi negada por aprovador, notificar o gestor
    if (!isManager) {
      const managers = await prisma.user.findMany({
        where: {
          departmentId: request.departmentId,
          role: "MANAGER",
          isActive: true,
        },
      });

      for (const manager of managers) {
        await this.createNotification({
          type: "REQUEST_CREATED",
          title: "Solicitação Negada",
          message: `A solicitação ${request.requestNumber} foi negada pelo aprovador`,
          userId: manager.id,
          requestId: request.id,
        });
      }
    }
  },
};