import expand from 'emmet'

// transform .$word into class=${word}
// transform $word into ${word}
// trasnform .$word.sub into class=${word.sub}
// transform $words[word:inner] into
// ${words.map(word => `<inner>`)}

// get all classes used (word, word.sub)
// ask 1 by 1 to write emmet css

// get all values used (word)
// ask 1 by 1 for a default value (and optional comment)

// Componet Name
// Prompt
// Emmet HTML
// Emmet CSS

// Componet Name
// Classes (generated)
// Parameters (generated)
// HTML (emmet expanded)
// CSS (emmet expanded)
// Handlers (generated)

export const zemmet = {
  css: cssExpand,
  html: htmlExpand
}


function cssExpand(str=''){
  let defs = str.split('\t')
  return defs.map(def => {
    let out = expand(def, {
      type: 'stylesheet',
      syntax: 'css',
      options: {
        'output.indent': '  ',
        'stylesheet.shortHex': false,
        'stylesheet.strictMatch': true
      }
    }).trim()
    if(!out.endsWith(';')){ out = out + ';' }
    return out
  }).filter(s => s.length > 1)
  .join('\n')
}

function htmlExpand(str=''){
  return postHTML(expand(preHTML(str), {
    type: 'markup',
    syntax: 'html',
    options: {
      'output.indent': '  ',
      'jsx.enabled': false
    }
  }))
}

function postHTML(html, { jsx = false } = {}) {
  let classes = []
  let params = []

  html = html.replace(
    /\b([a-zA-Z_:][-a-zA-Z0-9_:.]*)="___([A-Za-z0-9~]+)"/g,
    (_, attr, token) => {
      if(attr == 'class'){
        classes.push(token.split('.')[0])
      }
      return `${attr}=\${${token.replace(/~/g, '.')}}`
    }
  );

  // Pass 2: all other placeholders (inside text or mixed attribute values)
  html = html.replace(
    /___([A-Za-z0-9~]+)/g,
    (_, token) => {
      params.push(token.split('.')[0])
      return '${' + token.replace(/~/g, '.') + '}'
    }
  );

  return {html, classes, params, toString: () => html, [Symbol.toPrimitive]: () => html};
}

function replaceDollarVars(input) {
  return input.replace(
    /\.\$([A-Za-z0-9.]+)/g,
    (_, token) => '.___' + token.replace(/\./g, '~')
  ).replace(
    /\$([A-Za-z0-9.]+)/g,
    (_, token) => '{___' + token.replace(/\./g, '~') + '}'
  ).replace(
    /\$/g,
    ''
  )
}

function preHTML(abbr) {
  let s = replaceDollarVars(abbr)
  s = s.replace(/%/g, '$');
  return s;
}