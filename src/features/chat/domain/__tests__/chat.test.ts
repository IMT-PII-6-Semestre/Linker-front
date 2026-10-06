import { formatListTime, MAX_MESSAGE_LENGTH, sanitizeMessage, stripEmojis } from '../chat';

describe('chat só texto', () => {
  it('remove emojis, inclusive compostos e com tom de pele', () => {
    expect(stripEmojis('Oi 😀 tudo bem? 👍🏽')).toBe('Oi  tudo bem? ');
    expect(stripEmojis('Família 👨‍👩‍👧 ❤️')).toBe('Família  ');
    expect(stripEmojis('Brasil 🇧🇷')).toBe('Brasil ');
  });

  it('mantém acentos e pontuação', () => {
    expect(stripEmojis('Olá, João! Às 14h? Ação & reação — ok.')).toBe('Olá, João! Às 14h? Ação & reação — ok.');
  });

  it('sanitizeMessage descarta mensagens vazias e corta no limite', () => {
    expect(sanitizeMessage('   ')).toBeNull();
    expect(sanitizeMessage('😀😀')).toBeNull();
    expect(sanitizeMessage('  oi  ')).toBe('oi');
    expect(sanitizeMessage('a'.repeat(MAX_MESSAGE_LENGTH + 50))).toHaveLength(MAX_MESSAGE_LENGTH);
  });
});

describe('horário da lista', () => {
  const now = new Date(2026, 9, 6, 15, 0);

  it('hoje mostra a hora, ontem mostra "Ontem", antes mostra a data', () => {
    expect(formatListTime(new Date(2026, 9, 6, 9, 5).getTime(), now)).toBe('09:05');
    expect(formatListTime(new Date(2026, 9, 5, 23, 59).getTime(), now)).toBe('Ontem');
    expect(formatListTime(new Date(2026, 8, 28, 10, 0).getTime(), now)).toBe('28/09');
  });
});
