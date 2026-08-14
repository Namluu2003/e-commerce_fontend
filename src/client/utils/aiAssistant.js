import axios from "axios";
import { getProducts } from "../page/products/api";

const GEMINI_URL = import.meta.env.VITE_GEMINI_URL;

// Context và training data cho AI
const TRAINING_DATA = {
  context: `Bạn là trợ lý ảo của cửa hàng giày TheHands.
  
  Quy tắc trả lời:
  1. Câu hỏi luôn kết thúc bằng ""
  2. Câu trả lời luôn bắt đầu bằng ""
  3. Khi tư vấn sản phẩm:
     - Liệt kê thông tin cơ bản (tên, giá, thương hiệu)
     - Nêu các thông số kỹ thuật (size, màu, chất liệu)
     - Đề xuất 2-3 tính năng nổi bật
     - Kết thúc bằng 2-3 câu hỏi gợi ý để tư vấn thêm
  4. Giọng điệu thân thiện, chuyên nghiệp
  5. Trả lời ngắn gọn, dễ đọc
  6. Sử dụng bullet points để liệt kê
  
  Thông tin sản phẩm bao gồm:
  - Tên sản phẩm
  - Mã sản phẩm
  - Thương hiệu
  - Loại giày
  - Màu sắc
  - Chất liệu
  - Size
  - Đế giày
  - Giới tính
  - Số lượng
  - Giá
  - Cân nặng
  - Mô tả
  - Trạng thái`,
  
  examples: [
    {
      input: "Nike Air Jordan 1 thông tin về đôi này",
      output: `"Nike Air Jordan 1 thông tin về đôi này" end



Tính năng nổi bật:
- Thiết kế mang tính biểu tượng của dòng giày bóng rổ
- Chất liệu da cao cấp, độ bền cao
- Đế cao su chống trơn trượt tốt

Bạn quan tâm đến:
1. Chi tiết về chất liệu và độ bền?
2. Hướng dẫn chọn size phù hợp?
3. Cách phối đồ với Air Jordan 1?`
    },
    {
      input: "So sánh Nike Air Max và Air Jordan 1",
      output: `"So sánh Nike Air Max và Air Jordan 1" end




Bạn quan tâm đến:
1. Chi tiết về công nghệ đế giày?
2. Tư vấn lựa chọn phù hợp với nhu cầu?`
    },
    {
      input: "Tư vấn size giày Nike Air Jordan 1",
      output: `"Tư vấn size giày Nike Air Jordan 1" end


Hướng dẫn chọn size:
- Size 43 phù hợp chiều dài chân 27-27.5cm
- Form giày chuẩn, không cần chọn up/down size
- Có thể thử trực tiếp tại cửa hàng

Bạn cần:
1. Đo chính xác chiều dài chân?
2. Tư vấn cách đo size giày?
3. Đặt giữ size để thử tại cửa hàng?`
    }
  ]
};

// Thêm các hàm mới để fine-tuning
const FINE_TUNING_DATA = {
  // Lưu trữ các câu hỏi và câu trả lời thực tế từ người dùng
  userInteractions: [],
  
  // Lưu trữ các câu hỏi thường gặp
  frequentlyAskedQuestions: {},
  
  // Lưu trữ các phản hồi tích cực
  positiveResponses: [],
  
  // Lưu trữ các phản hồi cần cải thiện
  improvementNeeded: []
};

// Thêm các kỹ thuật xử lý câu trả lời
const RESPONSE_TECHNIQUES = {
  // Phân loại câu hỏi
  questionTypes: {
    GREETING: 'greeting',
    PRODUCT_INFO: 'product_info',
    PRODUCT_COMPARE: 'product_compare',
    SIZE_GUIDE: 'size_guide',
    PRICE_QUERY: 'price_query',
    STOCK_CHECK: 'stock_check'
  },

  // Các template câu trả lời
  templates: {
    productInfo: (product) => `"${product.productName} thông tin về đôi này" end


Thông tin cơ bản:
- Tên: ${product.productName}
- Giá: ${product.price.toLocaleString()}đ
- Thương hiệu: ${product.brandName}

Thông số kỹ thuật:
- Màu sắc: ${product.colorName}
- Chất liệu: ${product.materialName}
- Size: ${product.sizeName}
- Đế giày: ${product.soleName}
- Dành cho: ${product.genderName}
- Số lượng còn: ${product.quantity} đôi

Tính năng nổi bật:
${product.description.split('.').filter(s => s.trim()).map(s => `- ${s.trim()}`).join('\n')}

Bạn quan tâm đến:
1. Chi tiết về chất liệu và độ bền?
2. Hướng dẫn chọn size phù hợp?
3. Cách phối đồ với ${product.productName}?`,

    productCompare: (product1, product2) => `"So sánh ${product1.productName} và ${product2.productName}" end


${product1.productName}:
- Giá: ${product1.price.toLocaleString()}đ
- Phong cách: ${product1.typeName}
- Đế: ${product1.soleName}
- Chất liệu: ${product1.materialName}
- Thích hợp: ${product1.description}

${product2.productName}:
- Giá: ${product2.price.toLocaleString()}đ
- Phong cách: ${product2.typeName}
- Đế: ${product2.soleName}
- Chất liệu: ${product2.materialName}
- Thích hợp: ${product2.description}

Bạn quan tâm đến:
1. Chi tiết về công nghệ đế giày?
2. Tư vấn lựa chọn phù hợp với nhu cầu?`
  },

  // Phân tích ngữ cảnh
  analyzeContext: (question, chatHistory) => {
    const context = {
      previousQuestions: chatHistory.filter(msg => msg.sender === 'user').map(msg => msg.text),
      currentTopic: null,
      userPreferences: {}
    };

    // Phân tích câu hỏi trước đó để hiểu context
    context.previousQuestions.forEach(q => {
      if (q.includes('size')) context.userPreferences.sizeInterest = true;
      if (q.includes('giá')) context.userPreferences.priceInterest = true;
      if (q.includes('màu')) context.userPreferences.colorInterest = true;
    });

    return context;
  },

  // Cải thiện câu trả lời dựa trên context
  improveWithContext: (response, context) => {
    let improved = response;

    // Thêm thông tin dựa trên sở thích người dùng
    if (context.userPreferences.sizeInterest && !response.includes('size')) {
      improved += '\n\nBạn có vẻ quan tâm đến size, bạn muốn tôi tư vấn thêm về cách chọn size phù hợp không?';
    }
    if (context.userPreferences.priceInterest && !response.includes('giá')) {
      improved += '\n\nBạn có vẻ quan tâm đến giá, bạn muốn tôi gợi ý thêm các sản phẩm trong tầm giá tương tự không?';
    }

    return improved;
  }
};

// Hàm gửi câu hỏi đến AI
export const askAI = async (question, chatHistory = []) => {
  try {
    const products = await getProducts();
    
    // Phân tích context
    const context = RESPONSE_TECHNIQUES.analyzeContext(question, chatHistory);
    
    let productsInfo = "Hiện không có sản phẩm nào.";
    if (Array.isArray(products) && products.length > 0) {
      const topProducts = products.slice(0, 10);
      productsInfo = topProducts.map(p => 
        `- ${p.productName} (${p.brandName}): ${p.price}đ`
      ).join('\n');
    }
    
    // Xử lý câu trả lời với template nếu phù hợp
    if (question.includes('so sánh') && products.length >= 2) {
      const product1 = products[0];
      const product2 = products[1];
      return RESPONSE_TECHNIQUES.templates.productCompare(product1, product2);
    }
    
    // Gọi Gemini API như bình thường
    const prompt = `${TRAINING_DATA.context}\n\nDanh sách sản phẩm hiện có:\n${productsInfo}\n\nLịch sử chat:\n${chatHistory.map(msg => 
      `${msg.sender === 'user' ? 'Khách hàng' : 'Trợ lý'}: ${msg.text}`
    ).join('\n')}\n\nKhách hàng: ${question}\n\nTrợ lý:`;

    const response = await axios.post(
      GEMINI_URL,
      {
        contents: [{ parts: [{ text: prompt }] }],
      },
      { headers: { "Content-Type": "application/json" } }
    );

    let aiResponse = response.data.candidates[0]?.content?.parts?.[0]?.text || 
           "Xin lỗi, tôi không thể trả lời câu hỏi này ngay lúc này.";
           
    // Cải thiện câu trả lời với context
    aiResponse = RESPONSE_TECHNIQUES.improveWithContext(aiResponse, context);
    
    // Lưu lại tương tác
    saveUserInteraction(question, aiResponse, 'neutral');
    
    return formatResponse(aiResponse, products);
  } catch (error) {
    console.error("Lỗi khi gọi Gemini API:", error);
    return "Xin lỗi, hệ thống đang gặp sự cố. Vui lòng thử lại sau!";
  }
};

// Hàm format câu trả lời
const formatResponse = (response, products = []) => {
  // Kiểm tra nếu là lời chào
  const greetings = ["xin chào", "chào", "hi", "hello"];
  const isGreeting = greetings.some(greeting => 
    response.toLowerCase().includes(greeting)
  );
  
  if (isGreeting) {
    return response;
  }
  
  // Nếu response là một mảng sản phẩm
  if (Array.isArray(products) && products.length > 0) {
    const productList = products.map(product => 
      `- ${product.productName} (${product.brandName}): ${product.price.toLocaleString()}đ`
    ).join('\n');
    
    return `"Tìm kiếm sản phẩm" end


Các sản phẩm phù hợp:
${productList}

Bạn muốn biết thêm thông tin về sản phẩm nào?`;
  }
  
  return response;
};

// Hàm thêm training data mới
export const addTrainingData = (input, output) => {
  TRAINING_DATA.examples.push({ input, output });
};

// Hàm cập nhật context
export const updateContext = (newContext) => {
  TRAINING_DATA.context = newContext;
};

// Hàm lưu lại tương tác với người dùng
export const saveUserInteraction = (question, response, feedback) => {
  FINE_TUNING_DATA.userInteractions.push({
    question,
    response,
    feedback,
    timestamp: new Date().toISOString()
  });
  
  // Cập nhật câu hỏi thường gặp
  if (!FINE_TUNING_DATA.frequentlyAskedQuestions[question]) {
    FINE_TUNING_DATA.frequentlyAskedQuestions[question] = 1;
  } else {
    FINE_TUNING_DATA.frequentlyAskedQuestions[question]++;
  }
  
  // Lưu phản hồi
  if (feedback === 'positive') {
    FINE_TUNING_DATA.positiveResponses.push({ question, response });
  } else if (feedback === 'negative') {
    FINE_TUNING_DATA.improvementNeeded.push({ question, response });
  }
};

// Hàm tự động cải thiện câu trả lời
const improveResponse = (question, currentResponse) => {
  // Tìm câu trả lời tốt nhất từ các tương tác trước
  const bestResponses = FINE_TUNING_DATA.positiveResponses
    .filter(r => r.question.toLowerCase().includes(question.toLowerCase()))
    .map(r => r.response);
    
  if (bestResponses.length > 0) {
    return bestResponses[0];
  }
  
  return currentResponse;
};

// Hàm phân tích và cải thiện
export const analyzeAndImprove = () => {
  // Phân tích câu hỏi thường gặp
  const frequentQuestions = Object.entries(FINE_TUNING_DATA.frequentlyAskedQuestions)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
    
  // Tìm các câu trả lời cần cải thiện
  const needsImprovement = FINE_TUNING_DATA.improvementNeeded
    .map(item => item.question)
    .filter((q, i, arr) => arr.indexOf(q) === i);
    
  return {
    frequentQuestions,
    needsImprovement
  };
}; 