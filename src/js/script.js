document.addEventListener('DOMContentLoaded', () => {
  const animatedText = document.getElementById('animated-text');
  const editorContent = document.getElementById('editor-content');
  
  editorContent.style.whiteSpace = 'pre-wrap';
  
  const cssCode = `/* 
  Hey./*{delay:1000}*/ My name is Ahmet Recep Ildır./*{delay:1000}*/
  I am Middle Frontend Developer.
  
  Here you go...
*/

.developer {
  skills: 'JavaScript, Angular, SCSS';
  experience: '3+ years building enterprise apps';
  focus: 'User-centric frontend solutions';
}

.projects {
  ERP: 'Angular-based UI for complex workflows';
  ISG: 'Responsive dashboards with real-time data';
  tech-stack: 'Angular, RxJS, REST';
}

.portfolio {
  design: 'Accessible & responsive';
  animations: 'Performance-optimized';
  code-quality: 'Modular & maintainable';
}

/* Well.../*{delay:1000}*/ let's make it something change! */

* {
-webkit-transition: 1s all;
}

body {
  background-color: #f0f0f0;
}

.editor {
  width: 550px;
  border-radius: 8px; 
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}
`;
  
  const styleElement = document.createElement('style');
  document.head.appendChild(styleElement);
  
  function highlightCSS(code) {
    code = code.replace(/\/\*\{delay:\d+\}\*\//g, '');

    code = code.replace(/\/\*([\s\S]*?)\*\//g, '<span class="comment">/*$1*/</span>');
    
    code = code.replace(/(\.)([a-zA-Z-_0-9]+)/g, '$1<span class="class-name">$2</span>');
    code = code.replace(/({|})/g, '<span class="bracket">$1</span>');
    
    code = code.replace(/([a-zA-Z-]+)(\s*:\s*)([^;]+)(;)/g, function(match, prop, separator, value, semicolon) {
      const highlightedProp = `<span class="property">${prop}</span>`;
      
      const highlightedValue = value.replace(/([\d.]+)(rem|px|em|%|vh|vw|s)/g, 
        '<span class="value-number">$1</span><span class="value-unit">$2</span>');
      
      return `${highlightedProp}${separator}<span class="value">${highlightedValue}</span><span class="semicolon">${semicolon}</span>`;
    });
    
    return code;
  }
  
  let timeouts = [];

  function customSetTimeout(fn, delay) {
    const id = setTimeout(fn, delay);
    timeouts.push(id);
    return id;
  }

  function clearAllTimeouts() {
    timeouts.forEach(clearTimeout);
    timeouts = [];
  }

  function displayCSS() {
    let cssIndex = 0;
    let currentCSS = '';
    let actualCSS = '';
    let inComment = false;
    let inSelector = false;
    let inProperty = false;
    let inValue = false;
    let bracketDepth = 0;
    let buffer = '';
    let html = '';

    function typeCSSCode() {
      if (cssIndex < cssCode.length) {
        const delayMatch = cssCode.substring(cssIndex).match(/^\/\*\{delay:(\d+)\}\*\//);

        if (delayMatch) {
          const delayTime = parseInt(delayMatch[1]);
          cssIndex += delayMatch[0].length;
          customSetTimeout(typeCSSCode, delayTime);
          return;
        }

        const nextChar = cssCode.charAt(cssIndex);
        currentCSS += nextChar;

        if (!cssCode.substring(cssIndex).startsWith('/*{delay:')) {
          actualCSS += nextChar;
        }

        if (inComment) {
          buffer += nextChar;
          html += `<span class="comment">${nextChar}</span>`;

          if (buffer.endsWith('*/')) {
            inComment = false;
            buffer = '';
          }
        }
        else if (nextChar === '/' && cssIndex + 1 < cssCode.length && cssCode.charAt(cssIndex + 1) === '*') {
          if (cssCode.substring(cssIndex).match(/^\/\*\{delay:\d+\}\*\//)) {
            cssIndex++;
            customSetTimeout(typeCSSCode, 30);
            return;
          }
          inComment = true;
          buffer = '/';
          html += `<span class="comment">/</span>`;
        }
        else if (nextChar === '{') {
          bracketDepth++;
          inSelector = false;
          inProperty = true;
          html += `<span class="bracket">{</span>`;
        }
        else if (nextChar === '}') {
          bracketDepth--;
          inProperty = false;
          html += `<span class="bracket">}</span>`;
        }
        else if (nextChar === '.') {
          inSelector = true;
          html += '.';
        }
        else if (inSelector && (nextChar === ' ' || nextChar === '{')) {
          inSelector = false;
          html += nextChar === '{' ? `<span class="bracket">{</span>` : nextChar;
          if (nextChar === '{') {
            bracketDepth++;
            inProperty = true;
          }
        }
        else if (inSelector) {
          html += `<span class="class-name">${nextChar}</span>`;
        }
        else if (inProperty && nextChar === ':') {
          inProperty = false;
          inValue = true;
          html += nextChar;
        }
        else if (inValue && nextChar === ';') {
          inValue = false;
          inProperty = true;
          html += `<span class="semicolon">;</span>`;
        }
        else if (inValue) {
          html += `<span class="value">${nextChar}</span>`;
        }
        else if (inProperty && nextChar !== ' ' && nextChar !== '\n' && nextChar !== '\t') {
          html += `<span class="property">${nextChar}</span>`;
        }
        else {
          html += nextChar;
        }

        editorContent.innerHTML = html;
        editorContent.scrollTop = editorContent.scrollHeight;

        styleElement.textContent = actualCSS;

        cssIndex++;
        customSetTimeout(typeCSSCode, 30);
      }
    }

    typeCSSCode();
  }

  document.getElementById('skip-animation').addEventListener('click', () => {
    clearAllTimeouts();
    editorContent.innerHTML = highlightCSS(cssCode);
    editorContent.scrollTop = editorContent.scrollHeight;
    styleElement.textContent = cssCode.replace(/\/\*[\s\S]*?\*\//g, ''); 
  });

  displayCSS();
});
