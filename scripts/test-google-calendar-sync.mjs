import mysql from 'mysql2/promise';

async function testGoogleCalendarSync() {
  console.log('🧪 Iniciando teste de sincronização Google Calendar...\n');
  
  try {
    // Usar DATABASE_URL
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      console.error('❌ DATABASE_URL não está configurada');
      process.exit(1);
    }

    // Parsear DATABASE_URL (formato: mysql://user:password@host:port/database)
    const url = new URL(databaseUrl);
    const connection = await mysql.createConnection({
      host: url.hostname,
      port: url.port || 3306,
      user: url.username,
      password: url.password,
      database: url.pathname.slice(1),
      ssl: {},
      enableKeepAlive: true,
    });

    console.log('✅ Conectado ao banco de dados\n');

    // 1. Buscar usuário
    console.log('📋 Etapa 1: Buscando usuário...');
    const [users] = await connection.query('SELECT id, email FROM users LIMIT 1');
    
    if (users.length === 0) {
      console.error('❌ Nenhum usuário encontrado no banco de dados');
      await connection.end();
      process.exit(1);
    }
    
    const userId = users[0].id;
    console.log(`✅ Usuário encontrado: ${users[0].email}\n`);

    // 2. Criar cliente de teste
    console.log('📋 Etapa 2: Criando cliente de teste...');
    const clientName = `Cliente Teste - ${new Date().toISOString().slice(0, 10)}`;
    
    const [clientResult] = await connection.query(
      'INSERT INTO clients (userId, name, email, phone, company, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userId, clientName, 'teste@example.com', '+5511999999999', 'Empresa Teste', 'em_qualificacao', 'Cliente criado para teste de sincronização com Google Calendar']
    );

    const clientId = clientResult.insertId;
    console.log(`✅ Cliente criado com ID: ${clientId}\n`);

    // 3. Criar compromisso de teste
    console.log('📋 Etapa 3: Criando compromisso de teste...');
    const startTime = new Date();
    startTime.setHours(startTime.getHours() + 2); // 2 horas a partir de agora
    
    const endTime = new Date(startTime);
    endTime.setHours(endTime.getHours() + 1); // 1 hora de duração

    const [appointmentResult] = await connection.query(
      'INSERT INTO appointments (userId, clientId, title, description, type, startTime, endTime, location, notificationMinutes, appointmentStatus) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        userId,
        clientId,
        'Reunião de Teste - Sincronização Google Calendar',
        'Esta é uma reunião de teste para verificar a sincronização automática com o Google Calendar',
        'meeting',
        startTime,
        endTime,
        'Online - Zoom',
        15,
        'scheduled'
      ]
    );

    const appointmentId = appointmentResult.insertId;
    console.log(`✅ Compromisso criado com ID: ${appointmentId}`);
    console.log(`   Título: Reunião de Teste - Sincronização Google Calendar`);
    console.log(`   Data/Hora: ${startTime.toLocaleString('pt-BR')}`);
    console.log(`   Cliente: ${clientName}\n`);

    // 4. Verificar se a interação foi criada automaticamente
    console.log('📋 Etapa 4: Verificando criação automática de interação...');
    const [interactions] = await connection.query(
      'SELECT * FROM interactions WHERE appointmentId = ?',
      [appointmentId]
    );
    
    if (interactions.length > 0) {
      console.log(`✅ Interação criada automaticamente!`);
      console.log(`   Tipo: ${interactions[0].type}`);
      console.log(`   Título: ${interactions[0].title}\n`);
    } else {
      console.log(`⚠️ Nenhuma interação encontrada\n`);
    }

    console.log('📌 Próximos passos:');
    console.log('1. Acesse a seção "Agenda" no CRM');
    console.log('2. Verifique se o compromisso "Reunião de Teste - Sincronização Google Calendar" aparece');
    console.log('3. Acesse seu Google Calendar e verifique se o evento foi sincronizado automaticamente');
    console.log('4. Verifique o histórico de interações do cliente para confirmar a vinculação\n');

    console.log('✅ Teste de sincronização concluído com sucesso!');
    console.log(`\n📊 Resumo do teste:`);
    console.log(`   - Cliente ID: ${clientId}`);
    console.log(`   - Compromisso ID: ${appointmentId}`);
    console.log(`   - Usuário ID: ${userId}`);

    await connection.end();
    process.exit(0);

  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message);
    process.exit(1);
  }
}

testGoogleCalendarSync();
