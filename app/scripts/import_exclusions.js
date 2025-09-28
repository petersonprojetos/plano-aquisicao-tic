require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const { PrismaClient } = require('@prisma/client');
const xlsx = require('xlsx');
const path = require('path');

const prisma = new PrismaClient();

async function importExclusions() {
    try {
        console.log('Iniciando importação das exclusões de TIC...\n');

        // Ler o arquivo Excel
        const excelPath = path.join(process.cwd(), '..', 'Uploads', 'lista_exclusoes_tic.xlsx');
        console.log(`Lendo arquivo: ${excelPath}`);
        
        const workbook = xlsx.readFile(excelPath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(worksheet);
        
        console.log(`Encontrados ${data.length} registros no arquivo Excel\n`);

        // Verificar estrutura dos dados
        if (data.length > 0) {
            console.log('Estrutura dos dados:');
            console.log('Colunas disponíveis:', Object.keys(data[0]));
            console.log('Primeiro registro:');
            console.log(data[0]);
            console.log();
        }

        // Verificar registros existentes
        const existingExclusions = await prisma.itemExclusion.findMany({
            select: { code: true, name: true }
        });
        console.log(`Exclusões já existentes no banco: ${existingExclusions.length}\n`);

        let importedCount = 0;
        let updatedCount = 0;
        let skippedCount = 0;

        for (const row of data) {
            try {
                // Mapear colunas do Excel
                const code = String(row['Código'] || '').trim();
                const name = String(row['Item'] || '').trim();
                const justification = String(row['Justificativa'] || '').trim();

                if (!code || !name || !justification) {
                    console.log(`❌ Linha inválida - faltam dados obrigatórios:`, { code, name: name.substring(0, 50) + '...' });
                    skippedCount++;
                    continue;
                }

                // Verificar se a exclusão já existe
                const existing = await prisma.itemExclusion.findUnique({
                    where: { code: code }
                });

                if (existing) {
                    // Atualizar se houver diferenças
                    if (existing.name !== name || existing.justification !== justification) {
                        await prisma.itemExclusion.update({
                            where: { code: code },
                            data: {
                                name: name,
                                justification: justification,
                                isActive: true,
                                updatedAt: new Date()
                            }
                        });
                        console.log(`✅ Atualizado: ${code} - ${name.substring(0, 50)}...`);
                        updatedCount++;
                    } else {
                        console.log(`⏭️  Já existe (sem alterações): ${code} - ${name.substring(0, 50)}...`);
                        skippedCount++;
                    }
                } else {
                    // Criar nova exclusão
                    await prisma.itemExclusion.create({
                        data: {
                            code: code,
                            name: name,
                            justification: justification,
                            isActive: true
                        }
                    });
                    console.log(`✅ Criado: ${code} - ${name.substring(0, 50)}...`);
                    importedCount++;
                }

            } catch (error) {
                console.error(`❌ Erro ao processar linha:`, row, error.message);
                skippedCount++;
            }
        }

        // Verificar total final
        const totalExclusions = await prisma.itemExclusion.count();

        console.log('\n=== RESUMO DA IMPORTAÇÃO ===');
        console.log(`📊 Registros no arquivo: ${data.length}`);
        console.log(`✅ Exclusões criadas: ${importedCount}`);
        console.log(`🔄 Exclusões atualizadas: ${updatedCount}`);
        console.log(`⏭️  Registros ignorados: ${skippedCount}`);
        console.log(`📋 Total de exclusões no banco: ${totalExclusions}`);

        // Mostrar algumas exclusões importadas
        if (importedCount > 0 || updatedCount > 0) {
            console.log('\n=== ALGUMAS EXCLUSÕES IMPORTADAS ===');
            const recentExclusions = await prisma.itemExclusion.findMany({
                take: 5,
                orderBy: { updatedAt: 'desc' },
                select: { 
                    code: true, 
                    name: true, 
                    justification: true 
                }
            });

            recentExclusions.forEach((exclusion) => {
                console.log(`${exclusion.code} - ${exclusion.name}`);
                console.log(`   Justificativa: ${exclusion.justification.substring(0, 100)}...`);
                console.log();
            });
        }

        console.log('✅ Importação das exclusões concluída com sucesso!');

    } catch (error) {
        console.error('❌ Erro durante a importação:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Executar a importação se o arquivo for executado diretamente
if (require.main === module) {
    importExclusions()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}

module.exports = { importExclusions };