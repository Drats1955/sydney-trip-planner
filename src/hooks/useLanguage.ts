import { useState, useEffect } from 'react';

const GREETINGS: Record<string, string> = {
  'en': 'Hello! I am Sydney Visitors Trip Planer, your Sydney transport assistant. If you have a brochure or a photo of where you want to go, just tap the 🖼️ icon and I\'ll help you find your way!',
  'zh': '你好！我是 Sydney Visitors Trip Planer，您的悉尼交通助手。如果您有宣传册或想去的地方的照片，只需点击 🖼️ 图标，我就会帮您找到路！',
  'es': '¡Hola! Soy Sydney Visitors Trip Planer, tu asistente de transporte en Sídney. Si tienes un folleto o una foto de adónde quieres ir, ¡simplemente toca el ícono 🖼️ y te ayudaré a encontrar el camino!',
  'fr': 'Bonjour ! Je suis Sydney Visitors Trip Planer, votre assistant de transport à Sydney. Si vous avez une brochure ou une photo de l\'endroit où vous souhaitez aller, appuyez simplement sur l\'icône 🖼️ et je vous aiderai à trouver votre chemin !',
  'de': 'Hallo! Ich bin Sydney Visitors Trip Planer, Ihr Sydney-Transportassistent. Wenn Sie eine Broschüre oder ein Foto von Ihrem Ziel haben, tippen Sie einfach auf das 🖼️-Symbol und ich helfe Ihnen, den Weg zu finden!',
  'ja': 'こんにちは！シドニー交通アシスタントの Sydney Visitors Trip Planer です。パンフレットや行きたい場所の写真をお持ちの場合は、🖼️ アイコンをタップしてください。道案内をお手伝いします！',
  'ko': '안녕하세요! 시드니 교통 도우미 Sydney Visitors Trip Planer입니다. 안내 책자나 가고 싶은 곳의 사진이 있다면 🖼️ 아이콘을 누르세요. 길을 찾는 데 도움을 드릴게요!',
  'it': 'Ciao! Sono Sydney Visitors Trip Planer, il tuo assistente per i trasporti a Sydney. Se hai una brochure o una foto di dove vuoi andare, tocca l\'icona 🖼️ e ti aiuterò a trovare la strada!',
  'pt': 'Olá! Eu sou o Sydney Visitors Trip Planer, seu assistente de transporte em Sydney. Se você tiver um folheto ou uma foto de para onde quer ir, basta tocar no ícone 🖼️ e eu ajudarei você a encontrar o caminho!',
  'ar': 'مرحباً! أنا Sydney Visitors Trip Planer، مساعد النقل في سيدني. إذا كان لديك كتيب أو صورة للمكان الذي تريد الذهاب إليه، فما عليك سوى النقر على أيقونة 🖼️ وسأساعدك في العثور على طريقك!',
  'hi': 'नमस्ते! मैं Sydney Visitors Trip Planer हूँ, आपका सिडनी परिवहन सहायक। यदि आपके पास कोई ब्रोशर या फोटो है जहाँ आप जाना चाहते हैं, तो बस 🖼️ आइकन पर टैप करें और मैं आपको रास्ता खोजने में मदद करूँगा!',
};

export function useLanguage() {
  const [language, setLanguage] = useState('en');
  const [greeting, setGreeting] = useState(GREETINGS['en']);

  useEffect(() => {
    const userLang = navigator.language.split('-')[0];
    setLanguage(userLang);
    setGreeting(GREETINGS[userLang] || GREETINGS['en']);
  }, []);

  return { language, greeting };
}
