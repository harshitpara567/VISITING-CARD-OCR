function parseTextData(entities) {
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
      case 'PHONE':
        if (!leadData.phoneNumber) leadData.phoneNumber = Text.replace(/\D/g, '');
        break;
      case 'TITLE':
        if (!leadData.designation) leadData.designation = Text;
        break;
      case 'OTHER':
      default:
        unparsedData.push(Text);
        break;
    }
  });

  unparsedData.forEach(element => {
    if (element.includes('@') && element.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/)) {
      leadData.email = element;
    } else if (element.match(/(\+?\d{1,3}[-.\s]?)?(\(?\d{3,5}\)?[-.\s]?)?\d{3,5}[-.\s]?\d{3,5}/)) {
      leadData.phoneNumber = element.replace(/\D/g, '');
    } else if (element.match(/^(Founder|Co[- ]?Founder|CEO|Chief Executive Officer|CTO|Chief Technology Officer|COO|Chief Operating Officer|CFO|Chief Financial Officer|Manager|Product Manager|Project Manager|Director|Software Engineer|Developer|Engineer|Designer|Consultant|Analyst|Intern|President|Vice President|VP|Lead|Head|Marketing manager)\b/i)) {
      leadData.designation = element;
    } else if (element.match(/((https?:\/\/)?(www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,})(\/[^\s]*)?/gi)) {
      companyData.website = element;
    } else if (element.match(/\b([A-Z][a-zA-Z&,\.\- ]+(Inc|LLC|Ltd|Corporation|Company|Corp|Solutions|Technologies|Systems|Group|Studio|Associates|Agency|Services))\b/)) {
      companyData.name = element;
    }
  });

  return { leadData, companyData };
}

module.exports = { parseTextData };
