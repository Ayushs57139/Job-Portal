const fs = require('fs');
const path = require('path');
const multer = require('multer');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads/resumes');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'resume-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = ['.pdf', '.doc', '.docx', '.txt'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, DOCX, and TXT files are allowed'));
    }
  }
});

// Simple resume parsing function (you can integrate with AI services like OpenAI, AWS Textract, etc.)
function parseResume(filePath) {
  try {
    // This is a basic implementation - in production, you'd use AI services
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Extract email
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const emails = content.match(emailRegex) || [];
    const email = emails[0] || '';
    
    // Extract phone numbers
    const phoneRegex = /(\+?91[\s-]?)?[6-9]\d{9}|(\+?91[\s-]?)?[0-9]{10}/g;
    const phones = content.match(phoneRegex) || [];
    const phone = phones[0] || '';
    
    // Extract name (look for common patterns)
    const nameRegex = /(?:Name|Full Name|First Name|Last Name)[\s:]*([A-Za-z\s]+)/i;
    const nameMatch = content.match(nameRegex);
    let firstName = '';
    let lastName = '';
    
    if (nameMatch) {
      const fullName = nameMatch[1].trim();
      const nameParts = fullName.split(' ');
      firstName = nameParts[0] || '';
      lastName = nameParts.slice(1).join(' ') || '';
    }
    
    // Extract skills
    const skillsRegex = /(?:Skills|Technical Skills|Core Competencies)[\s:]*([A-Za-z\s,]+)/i;
    const skillsMatch = content.match(skillsRegex);
    const skills = skillsMatch ? skillsMatch[1].split(',').map(s => s.trim()).filter(s => s) : [];
    
    // Extract experience
    const expRegex = /(?:Experience|Work Experience|Professional Experience)[\s:]*([0-9]+(?:\.[0-9]+)?)\s*(?:years?|yrs?)/i;
    const expMatch = content.match(expRegex);
    const experience = expMatch ? expMatch[1] : '';
    
    // Extract education
    const eduRegex = /(?:Education|Academic|Qualification)[\s:]*([A-Za-z\s,0-9]+)/i;
    const eduMatch = content.match(eduRegex);
    const education = eduMatch ? eduMatch[1] : '';
    
    // Extract current job title
    const jobTitleRegex = /(?:Current|Present|Position|Title)[\s:]*([A-Za-z\s]+)/i;
    const jobTitleMatch = content.match(jobTitleRegex);
    const currentJobTitle = jobTitleMatch ? jobTitleMatch[1].trim() : '';
    
    // Extract current company
    const companyRegex = /(?:Company|Organization|Employer)[\s:]*([A-Za-z\s&.,]+)/i;
    const companyMatch = content.match(companyRegex);
    const currentCompany = companyMatch ? companyMatch[1].trim() : '';
    
    // Extract location
    const locationRegex = /(?:Location|Address|City)[\s:]*([A-Za-z\s,]+)/i;
    const locationMatch = content.match(locationRegex);
    const location = locationMatch ? locationMatch[1].trim() : '';
    
    return {
      firstName,
      lastName,
      email,
      phone,
      skills: skills.join(', '),
      experience,
      education,
      currentJobTitle,
      currentCompany,
      location,
      rawContent: content.substring(0, 1000) // First 1000 characters for reference
    };
  } catch (error) {
    console.error('Error parsing resume:', error);
    throw new Error('Failed to parse resume');
  }
}

// Enhanced AI-powered resume parsing (integrate with OpenAI or similar service)
async function parseResumeWithAI(filePath) {
  try {
    // For now, we'll use the basic parsing
    // In production, you would:
    // 1. Convert PDF/DOC to text using libraries like pdf-parse, mammoth
    // 2. Send text to OpenAI API for structured extraction
    // 3. Return structured data
    
    const basicData = parseResume(filePath);
    
    // Here you could integrate with OpenAI API:
    /*
    const openai = require('openai');
    const client = new openai.OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    
    const response = await client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{
        role: "system",
        content: "Extract structured information from this resume text. Return JSON with fields: firstName, lastName, email, phone, skills (array), experience (string), education (string), currentJobTitle, currentCompany, location."
      }, {
        role: "user",
        content: basicData.rawContent
      }]
    });
    
    return JSON.parse(response.choices[0].message.content);
    */
    
    return basicData;
  } catch (error) {
    console.error('Error in AI resume parsing:', error);
    throw new Error('Failed to parse resume with AI');
  }
}

module.exports = {
  upload,
  parseResume,
  parseResumeWithAI
};
