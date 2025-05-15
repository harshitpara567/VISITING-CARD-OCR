function parseTextData(entities, rawText) {
  const leadData = {};
  const companyData = {};
  let unparsedData = [];

  entities.forEach(entity => {
    const { Type, Text } = entity;

    switch (Type) {
      case 'PERSON':
        if (!leadData.name) leadData.name = Text;
        break;
      case 'ORGANIZATION':
        if (!companyData.name) companyData.name = Text;
        break;
      case 'LOCATION':
        if (!companyData.address) companyData.address = Text;
        break;
      case 'EMAIL':
        if (!leadData.email) leadData.email = Text;
        break;
      case 'PHONE_NUMBER':
        if (!leadData.phoneNumber) leadData.phoneNumber = Text.replace(/\D/g, '');
        break;
     
      case 'OTHER':
        unparsedData.push(Text);
        break;
      default:
        unparsedData.push(Text);
        break;
    }
  });

 
  if (leadData.name && !leadData.designation) {
    const nameIndex = rawText.indexOf(leadData.name);
    let potentialDesignation = "";

    
    let nextEntityIndex = rawText.length;
    for (const entity of entities) {
      if (entity.BeginOffset > nameIndex && entity.Type !== 'PERSON') {
        nextEntityIndex = Math.min(nextEntityIndex, entity.BeginOffset);
      }
    }

    if (nextEntityIndex > nameIndex + leadData.name.length) {
      potentialDesignation = rawText.substring(nameIndex + leadData.name.length, nextEntityIndex).trim();
      if (potentialDesignation && potentialDesignation.length < 100 && isLikelyDesignation(potentialDesignation)) {
        leadData.designation = potentialDesignation;
      }
    } else {
      
      const remainingText = rawText.substring(nameIndex + leadData.name.length).trim();
      const firstSpaceIndex = remainingText.indexOf(' ');
      if (firstSpaceIndex > 0 && firstSpaceIndex < 80 && isLikelyDesignation(remainingText.substring(0, firstSpaceIndex))) {
        leadData.designation = remainingText.substring(0, firstSpaceIndex);
      } else if (remainingText.length < 80 && isLikelyDesignation(remainingText)) {
        leadData.designation = remainingText;
      }
    }
  }

  
  unparsedData.forEach(element => {
    if (!leadData.email && element.includes('@') && element.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/)) {
      leadData.email = element;
    } else if (!leadData.phoneNumber && element.match(/(\+?\d{1,3}[-.\s]?)?(\(?\d{3,5}\)?[-.\s]?)?\d{3,5}[-.\s]?\d{3,5}/)) {
      leadData.phoneNumber = element.replace(/\D/g, '');
    } else if (!companyData.website && element.match(/((https?:\/\/)?(www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,})(\/[^\s]*)?/gi)) {
      companyData.website = element;
    } else if (!companyData.name && element.match(/\b([A-Z][a-zA-Z&,\.\- ]+(Inc|LLC|Ltd|Corporation|Company|Corp|Solutions|Technologies|Realtor|Systems|Group|Studio|Associates|Agency|Services))\b/)) {
      companyData.name = element;
    }
  });

  return { leadData, companyData };
}

function isLikelyDesignation(text) {
  const jobTitleRegex = /^(Founder|Co-Founder|CEO|Chief.*Officer|CTO|COO|CFO|CMO|CHRO|CIO|CSO|CPO|Managing Director|Relator|Executive Director|Director|VP|Vice President|President|Partner|Principal|Owner|Proprietor|General Manager|Operations Manager|Product Manager|Marketing Manager|Sales Manager|Business Development Manager|Project Manager|Program Manager|Account Manager|CEO Founder|Finance Manager|HR Manager|IT Manager|Team Lead|Lead Developer|Lead Designer|Head|Head of Engineering|Head of Design|Head of Marketing|Engineer|Software Engineer|Senior Engineer|Junior Engineer|Full Stack Developer|Backend Developer|Frontend Developer|Mobile Developer|Developer|Designer|UX Designer|UI Designer|Graphic Designer|Product Designer|Consultant|Business Analyst|Data Analyst|Financial Analyst|Research Analyst|Marketing Analyst|Strategy Analyst|Specialist|HR Specialist|IT Specialist|Support Specialist|Agent|Sales Agent|Real Estate Agent|Insurance Agent|Customer Service Representative|Associate|HR Associate|Sales Associate|Marketing Associate|Administrative Assistant|Executive Assistant|Office Assistant|Intern|Software Intern|Marketing Intern|HR Intern|Legal Intern|Trainee|Apprentice|Freelancer|Contractor|Advisor|Strategist|Coordinator|Supervisor|Administrator|Technician|Scientist|Data Scientist|Researcher|Lecturer|Professor|Teacher|Instructor|Trainer|Coach|Content Writer|Copywriter|Editor|Journalist|Reporter|Photographer|Videographer|Artist|Architect|Lawyer|Attorney|Advocate|Paralegal|Accountant|Chartered Accountant|CA|Auditor|Treasurer|Economist|Banker|Investment Banker|Trader|Broker|Doctor|Physician|Surgeon|Dentist|Therapist|Psychologist|Pharmacist|Nurse|Veterinarian|Lab Technician|Biomedical Engineer|Civil Engineer|Mechanical Engineer|Electrical Engineer|Chemical Engineer|QA Engineer|Test Engineer|Systems Engineer|Network Engineer|DevOps Engineer|Security Engineer|Machine Learning Engineer|AI Engineer|Blockchain Developer|Game Developer|Sound Engineer|Event Planner|Event Manager|Public Relations Manager|Social Media Manager|Community Manager|Digital Marketing Specialist|SEO Specialist|SEM Specialist|Growth Hacker|E-commerce Manager|Sales Representative|Realtor)\b/i;

  return jobTitleRegex.test(text);
}


module.exports = { parseTextData };