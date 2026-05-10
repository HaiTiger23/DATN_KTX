const fs = require('fs');
const path = require('path');

const tabs = [
  'AdminStudentsTab.jsx',
  'AdminRequestsTab.jsx',
  'AdminContractsTab.jsx',
  'AdminFeedbacksTab.jsx',
  'AdminKnowledgeTab.jsx',
  'AdminNotificationsTab.jsx',
  'StudentRequestsTab.jsx',
  'StudentContractsTab.jsx',
  'StudentFeedbacksTab.jsx'
];

for (const tab of tabs) {
  const file = path.join(__dirname, 'frontend/src/components/tabs', tab);
  if (!fs.existsSync(file)) continue;
  
  let content = fs.readFileSync(file, 'utf8');

  // Find the component signature
  const sigRegex = /export default function (\w+)\(\{\s*(.*?)\s*\}\) \{/;
  content = content.replace(sigRegex, (match, name, props) => {
    if (!props.includes('pagination')) {
      return `export default function ${name}({ ${props}, pagination }) {`;
    }
    return match;
  });

  // Replace pagination={{ pageSize: 10 }} with pagination={pagination}
  // OR pagination={false} or any pagination={...} inside <Table
  content = content.replace(/<Table(.*?)pagination=\{.*?\}(.*?)>/g, '<Table$1pagination={pagination}$2>');
  
  // What if it just doesn't have pagination prop?
  if (!content.match(/<Table.*?pagination=/)) {
     content = content.replace(/<Table(.*?)>/, '<Table$1 pagination={pagination}>');
  }

  fs.writeFileSync(file, content, 'utf8');
  console.log(`Updated: ${file}`);
}
