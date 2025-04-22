// eslint-disable-next-line no-unused-vars  
function parseTextData(entities, fullText = '') {
    const data = {};
    let unprasedData = []
    entities.forEach(entity => {
      const { Type, Text } = entity;
  
      switch (Type) {
        case 'PERSON':
          if (!data.name) data.name = Text;
          break;
        case 'ORGANIZATION':
          if (!data.CompanyName) data.CompanyName = Text;
          break;
        case 'LOCATION':
          if (!data.CompanyAddress) data.CompanyAddress = Text;
          break;
        case 'EMAIL':
          if (!data.email) data.email = Text;
          break;
        case 'PHONE':
          if (!data.phoneNumber) data.phoneNumber = Text.replace(/\D/g, '');
          break;
        case 'TITLE':
          if (!data.Designation) data.Designation = Text;
          break;
        case 'OTHER':
            unprasedData.push(Text)
          break;
        default:
            unprasedData.push(Text)
          break;
      }
    });
  
    for (const element of unprasedData) {
        if (element.includes('@') && element.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/)) {
            data.email = element
        } else if (element.match(/(\+?\d{1,3}[-.\s]?)?(\(?\d{3,5}\)?[-.\s]?)?\d{3,5}[-.\s]?\d{3,5}/)) {
            data.phoneNumber = element.replace(/\D/g, '')
        } else if (element.match(/^(Founder|Co[- ]?Founder|CEO|Chief Executive Officer|CTO|Chief Technology Officer|COO|Chief Operating Officer|CFO|Chief Financial Officer|Manager|Product Manager|Project Manager|Director|Software Engineer|Developer|Engineer|Designer|Consultant|Analyst|Intern|President|Vice President|VP|Lead|Head)\b/i)) {
            data.Designation = element
        } else if (element.match(/((https?:\/\/)?(www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,})(\/[^\s]*)?/gi)) {
            data.CompanyWebsite = element
        }else if (element.match(/\b([A-Z][a-zA-Z&,\.\- ]+(Inc|LLC|Ltd|Corporation|Company|Corp|Solutions|Technologies|Systems|Group|Studio|Associates|Agency|Services))\b/)) {
            data.CompanyName = element
        }
    }
  
    return data;
  }
  
  module.exports = {
    parseTextData
  };
  