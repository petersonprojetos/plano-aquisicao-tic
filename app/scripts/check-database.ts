
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log('=== TIPOS DE DEPARTAMENTO EXISTENTES ===');
    const departmentTypes = await prisma.departmentType.findMany();
    console.log(`Encontrados: ${departmentTypes.length}`);
    departmentTypes.forEach(type => {
      console.log(`- ${type.name} (${type.code})`);
    });
    
    console.log('\n=== DEPARTAMENTOS EXISTENTES ===');
    const departments = await prisma.department.findMany({ 
      include: { type: true, parent: true },
      take: 10
    });
    console.log(`Encontrados: ${departments.length} (mostrando 10 primeiros)`);
    departments.forEach(dept => {
      const type = dept.type ? dept.type.name : 'Sem tipo';
      const parent = dept.parent ? dept.parent.name : 'Sem pai';
      console.log(`- ${dept.name} (${dept.code}) - Tipo: ${type} - Pai: ${parent}`);
    });
    
  } catch(error) {
    console.error('Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
