

import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log("🔄 Atualizando solicitações existentes com tipos de contrato e aquisição...");

  try {
    // Buscar tipos de contrato e aquisição disponíveis
    const contractTypes = await prisma.contractType.findMany({ where: { isActive: true } });
    const acquisitionTypes = await prisma.acquisitionTypeMaster.findMany({ where: { isActive: true } });

    // Buscar todas as solicitações
    const requests = await prisma.request.findMany({
      include: {
        items: true
      }
    });

    console.log(`📋 Encontradas ${requests.length} solicitações para atualizar...`);

    for (const request of requests) {
      console.log(`🔄 Atualizando solicitação ${request.requestNumber}...`);

      // Atualizar os itens da solicitação com tipos aleatórios
      for (const item of request.items) {
        // Selecionar tipo de contrato aleatório
        const randomContractType = contractTypes[Math.floor(Math.random() * contractTypes.length)];
        
        // Selecionar tipo de aquisição aleatório
        const randomAcquisitionType = acquisitionTypes[Math.floor(Math.random() * acquisitionTypes.length)];

        await prisma.requestItem.update({
          where: { id: item.id },
          data: {
            contractTypeId: randomContractType.id,
            acquisitionTypeMasterId: randomAcquisitionType.id
          }
        });
      }
    }

    console.log("✅ Todas as solicitações foram atualizadas com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao atualizar solicitações:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

