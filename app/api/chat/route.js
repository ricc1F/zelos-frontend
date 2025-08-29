// Local do arquivo: app/api/chat/route.js

// A importação do Cohere não é mais necessária, então foi removida.

// Lista de palavras a serem filtradas.
export const badWords = [
  // Português - palavrões fortes e variações
  "bosta", "merda", "merdinha", "cocô", "coco",
  "caralho", "carai", "karalho", "krl", "krll",
  "porra", "poha", "pqp", "pqporra", "pqpqp",
  "puta", "putaria", "putinha", "puto", "putona",
  "foda", "fodido", "fodida", "fuder", "fodase", "foda-se", "se fuder", "vai se fuder",
  "cuzão", "cuzao", "cu", "cusão", "cuzinho",
  "buceta", "bucetinha", "xoxota", "xota", "xereca", "xoxotinha", "perereca",
  "pau", "pausão", "pauzinho", "piroca", "rola", "roludo",
  "pênis", "penis", "caralhinho",
  "boquete", "boquetinho", "mamador", "mamando",
  "arrombado", "arrombada", "arrombados",
  "otário", "otaria", "otarios", "otaria", "otário",
  "burro", "burra", "idiota", "imbecil", "retardado", "retardada",
  "mongoloide", "mongolóide", "downzinho",
  "corno", "corninho", "cornudo", "corna",
  "viado", "viadinho", "bicha", "bichinha", "boiola", "baitola",
  "nojento", "nojenta", "desgraça", "desgraçado", "maldito", "maldita",
  "miserável", "vagabundo", "vagabunda", "lixo", "escroto", "escrota",
  "animal", "animalesco", "cachorro", "cachorra", "cachorrão",
  "demônio", "capeta", "satanás", "satanas",

  // Inglês - palavrões e variações
  "fuck", "fucking", "fucker", "motherfucker", "mf", "wtf",
  "shit", "bullshit", "holyshit",
  "bitch", "bitches", "sonofabitch",
  "ass", "asshole", "jackass", "dumbass", "smartass",
  "dick", "dicks", "dickhead",
  "cock", "bigcock", "cockhead",
  "pussy", "pussies", "pussypass",
  "cunt", "cunts", "fuckingcunt",
  "slut", "sluts", "slutty", "whore", "whores", "whoring",
  "bastard", "jerk", "prick", "twat", "moron", "idiot",
  "retard", "retarded", "stupid", "dumb", "loser", "scumbag",
  "hoe", "skank", "tramp",

  // Termos violentos / gatilho
  "matar", "assassinar", "assassinato", "estuprar", "estupro",
  "suicídio", "suicidio", "suicidar", "suicidarse", "suicidar-se",
  "morte", "morrer", "se matar", "autoextermínio",
  "violência", "violento", "esfaquear", "fuzilar", "atirar", "tiro",
  "kill", "murder", "rape", "rapist", "die", "death",
  "suicide", "selfharm", "self-harm", "hang", "shoot", "stab",

  // Variações escritas com erro comum / internetês
  "f0da", "fod4", "phoda", "f0der", "fuder", "fodase", "fodasse",
  "caralhu", "karai", "krai", "krlh", "krll", "crl",
  "poha", "p0rra", "p0ha", "merd4", "b0sta",
  "x0x0ta", "bucet4", "p3nis", "r0la", "r0lha",
  "put@","pvt@", "b!tch", "f*ck", "sh1t", "d1ck", "a$$"
];

// A função se chama POST para responder a requisições desse tipo.
export async function POST(req) {
  try {
    const { message } = await req.json();

    if (!message) {
      return new Response(JSON.stringify({ error: "A mensagem não pode estar vazia." }), { status: 400 });
    }

    const lowerCaseMessage = message.toLowerCase().trim();

    // 1. FILTRO DE PALAVRAS IMPRÓPRIAS (A mensagem de retorno já é em português)
    const hasBadWord = badWords.some(word => lowerCaseMessage.includes(word));
    if (hasBadWord) {
      // Retorna nossa mensagem customizada em português
      return new Response(JSON.stringify({ reply: "Por favor, vamos manter a conversa respeitosa e profissional." }), { status: 200 });
    }
    
    // 2. SISTEMA DE ÁRVORE DE OPÇÕES (sem IA)
    const treeOptions = {
      "1": "📂 Você escolheu: Suporte Técnico.\n1.1 Problemas de conexão\n1.2 Erro no sistema",
      "1.1": "Para resolver problemas de conexão, por favor, reinicie seu modem e tente novamente.",
      "1.2": "Entendido. Para que eu possa ajudar, por favor, descreva o erro que está aparecendo.",
      "2": "💰 Você escolheu: Financeiro.\n2.1 2ª via de Boleto\n2.2 Nota Fiscal",
      "2.1": "A segunda via do seu boleto pode ser emitida através do nosso site na área do cliente.",
      "2.2": "Sua nota fiscal é enviada automaticamente para o seu email de cadastro.",
      "3": "📦 Você escolheu: Vendas.\n3.1 Fazer um orçamento\n3.2 Falar com um vendedor",
      "3.1": "Para solicitar um orçamento detalhado, por favor, envie um email para vendas@suaempresa.com.",
      "3.2": "Vou te transferir para um de nossos vendedores. Por favor, aguarde um momento.",
    };

    if (treeOptions[lowerCaseMessage]) {
      return new Response(JSON.stringify({ reply: treeOptions[lowerCaseMessage] }), { status: 200 });
    }

    // 3. TRATAMENTO PARA OPÇÕES INVÁLIDAS
    if (/^[\d.]+$/.test(lowerCaseMessage) && !treeOptions[lowerCaseMessage]) {
      return new Response(JSON.stringify({ reply: "Opção inválida. Por favor, escolha um dos números da lista." }), { status: 200 });
    }

    // 4. MENSAGEM PADRÃO PARA QUALQUER OUTRA COISA
    // Como a IA foi removida, qualquer mensagem que não se encaixe na árvore
    // receberá esta resposta padrão.
    const defaultReply = "Desculpe, não entendi sua solicitação. Você pode escolher uma das opções numéricas para que eu possa te ajudar.";
    return new Response(JSON.stringify({ reply: defaultReply }), { status: 200 });

  } catch (error) {
    console.error("ERRO NA API:", error); 
    // Mensagem de erro genérica para o frontend
    return new Response(JSON.stringify({ error: "Ocorreu um erro no servidor. Tente novamente mais tarde." }), { status: 500 });
  }
}