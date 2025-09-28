require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkData() {
  try {
    console.log('=== DADOS DAS SOLICITAÇÕES ===');
    const requests = await prisma.request.findMany({
      select: {
        id: true,
        requestNumber: true,
        status: true,
        managerStatus: true,
        approverStatus: true,
        user: {
          select: {
            name: true,
            role: true
          }
        },
        department: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`Total de solicitações: ${requests.length}`);
    console.log('\nDetalhes das solicitações:');
    
    requests.forEach((request, index) => {
      console.log(`\n${index + 1}. Solicitação: ${request.requestNumber}`);
      console.log(`   Status: ${request.status}`);
      console.log(`   Manager Status: ${request.managerStatus}`);
      console.log(`   Approver Status: ${request.approverStatus}`);
      console.log(`   Solicitante: ${request.user.name} (${request.user.role})`);
      console.log(`   Departamento: ${request.department.name}`);
    });

    console.log('\n=== CONTADORES POR STATUS ===');
    
    const statusCounts = await prisma.request.groupBy({
      by: ['status'],
      _count: true,
    });
    
    console.log('Por RequestStatus:');
    statusCounts.forEach(item => {
      console.log(`  ${item.status}: ${item._count}`);
    });

    const managerStatusCounts = await prisma.request.groupBy({
      by: ['managerStatus'],
      _count: true,
    });
    
    console.log('\nPor ManagerStatus:');
    managerStatusCounts.forEach(item => {
      console.log(`  ${item.managerStatus}: ${item._count}`);
    });

    const approverStatusCounts = await prisma.request.groupBy({
      by: ['approverStatus'],
      _count: true,
    });
    
    console.log('\nPor ApproverStatus:');
    approverStatusCounts.forEach(item => {
      console.log(`  ${item.approverStatus}: ${item._count}`);
    });

    console.log('\n=== VERIFICAÇÃO DOS DASHBOARDS ===');
    
    // User summary (corrigido)
    const userSummary = await Promise.all([
      prisma.request.count(),
      prisma.request.count({
        where: { 
          status: { in: ["OPEN", "PENDING_MANAGER_APPROVAL", "PENDING_APPROVAL"] }
        }
      }),
      prisma.request.count({
        where: { 
          status: "APPROVED"
        }
      }),
      prisma.request.count({
        where: { 
          status: "COMPLETED"
        }
      })
    ]);
    
    console.log('\nUser Dashboard (deveria mostrar):');
    console.log(`  Total: ${userSummary[0]}`);
    console.log(`  Pendentes: ${userSummary[1]}`);
    console.log(`  Aprovadas: ${userSummary[2]}`);
    console.log(`  Concluídas: ${userSummary[3]}`);

    // Manager summary
    const managerSummary = await Promise.all([
      prisma.request.count(),
      prisma.request.count({
        where: { 
          status: "PENDING_MANAGER_APPROVAL",
          managerStatus: "PENDING_AUTHORIZATION"
        }
      }),
      prisma.request.count({
        where: {
          status: "PENDING_APPROVAL",
          managerStatus: "AUTHORIZE",
          approverStatus: "PENDING_APPROVAL"
        }
      }),
      prisma.request.count({
        where: { status: "APPROVED" }
      })
    ]);
    
    console.log('\nManager Dashboard (deveria mostrar):');
    console.log(`  Total: ${managerSummary[0]}`);
    console.log(`  Pendentes Autorização (Manager): ${managerSummary[1]}`);
    console.log(`  Pendentes Aprovação Final: ${managerSummary[2]}`);
    console.log(`  Aprovadas: ${managerSummary[3]}`);

    // Approver summary
    const approverSummary = await Promise.all([
      prisma.request.count(),
      prisma.request.count({
        where: { 
          status: "PENDING_MANAGER_APPROVAL",
          managerStatus: "PENDING_AUTHORIZATION"
        }
      }),
      prisma.request.count({
        where: {
          status: "PENDING_APPROVAL",
          managerStatus: "AUTHORIZE",
          approverStatus: "PENDING_APPROVAL"
        }
      }),
      prisma.request.count({
        where: { status: "APPROVED" }
      })
    ]);
    
    console.log('\nApprover Dashboard (deveria mostrar):');
    console.log(`  Total: ${approverSummary[0]}`);
    console.log(`  Pendentes Autorização Manager: ${approverSummary[1]}`);
    console.log(`  Pendentes Aprovação Final: ${approverSummary[2]}`);
    console.log(`  Aprovadas: ${approverSummary[3]}`);
    
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();