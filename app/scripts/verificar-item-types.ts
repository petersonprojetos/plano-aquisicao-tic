
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function verificarTiposItem() {
  try {
    console.log('=== VERIFICAÇÃO DOS TIPOS DE ITEM IMPORTADOS ===\n');
    
    // Buscar todos os tipos de item ordenados por código
    const tiposItem = await prisma.itemTypeMaster.findMany({
      orderBy: { code: 'asc' }
    });
    
    console.log(`Total de tipos de item no banco: ${tiposItem.length}`);
    console.log('\n=== LISTAGEM COMPLETA ===\n');
    
    tiposItem.forEach((tipo, index) => {
      console.log(`${index + 1}. Código: ${tipo.code}`);
      console.log(`   Nome: ${tipo.name}`);
      console.log(`   Descrição: ${tipo.description?.substring(0, 120)}...`);
      console.log(`   Status: ${tipo.isActive ? 'Ativo' : 'Inativo'}`);
      console.log(`   Criado em: ${tipo.createdAt.toLocaleString('pt-BR')}`);
      console.log('   ---');
    });
    
    // Verificar especificamente os códigos CAT.01 a CAT.13 (os que acabamos de importar)
    console.log('\n=== VERIFICAÇÃO DOS CÓDIGOS IMPORTADOS (CAT.01 - CAT.13) ===\n');
    
    const tiposImportados = await prisma.itemTypeMaster.findMany({
      where: {
        code: {
          startsWith: 'CAT.'
        }
      },
      orderBy: { code: 'asc' }
    });
    
    console.log(`Tipos com código CAT.XX encontrados: ${tiposImportados.length}`);
    
    tiposImportados.forEach((tipo) => {
      console.log(`✓ ${tipo.code} - ${tipo.name}`);
    });
    
  } catch (error) {
    console.error('Erro durante a verificação:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verificarTiposItem();
