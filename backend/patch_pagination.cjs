const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Regex to match:
  // const getSomething = async (req, res) => {
  //   try {
  //     const data = await Model.find(...)...;
  //     res.json(data);
  //   }
  
  const regex = /const (get\w+) = async \(req, res\) => \{\s*try\s*\{\s*(const|let) (\w+) = await ([A-Z]\w+)\.find\((.*?)\)([\s\S]*?);\s*res\.json\(\3\);\s*\} catch \(error\) \{/g;
  
  content = content.replace(regex, (match, funcName, varType, varName, modelName, filterArgs, chain) => {
    changed = true;
    const filter = filterArgs.trim() === '' ? '{}' : filterArgs;
    
    return `const ${funcName} = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const ${varName} = await ${modelName}.find(${filter})${chain}.skip(skip).limit(limit);
    const total = await ${modelName}.countDocuments(${filter});

    res.json({
      data: ${varName},
      pagination: { current: page, pageSize: limit, total }
    });
  } catch (error) {`;
  });

  // Handle export const getKnowledge = async ...
  const regexExport = /export const (get\w+) = async \(req, res\) => \{\s*try\s*\{\s*(const|let) (\w+) = await ([A-Z]\w+)\.find\((.*?)\)([\s\S]*?);\s*res\.json\(\3\);\s*\} catch \(error\) \{/g;
  content = content.replace(regexExport, (match, funcName, varType, varName, modelName, filterArgs, chain) => {
    changed = true;
    const filter = filterArgs.trim() === '' ? '{}' : filterArgs;
    return `export const ${funcName} = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const ${varName} = await ${modelName}.find(${filter})${chain}.skip(skip).limit(limit);
    const total = await ${modelName}.countDocuments(${filter});

    res.json({
      data: ${varName},
      pagination: { current: page, pageSize: limit, total }
    });
  } catch (error) {`;
  });

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

function walk(dir) {
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const p = path.join(dir, file);
    if (fs.statSync(p).isDirectory()) {
      walk(p);
    } else if (p.endsWith('Controller.js')) {
      processFile(p);
    }
  }
}

walk(path.join(__dirname, 'src/controllers'));
