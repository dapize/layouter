let lib = require('../dist/layouter');
const Layouter = new lib({
  breakPoints: {
    xs: {
      width: 320,
      cols: 15,
      direct: true
    },
    sm: {
      width: 768,
      cols: 31
    },
    md: {
      width: 1024,
      cols: 31
    }
  }
});

describe('Setting max height', () => {
  it('simple', () => {
    const myDiv = document.createElement('div');
    myDiv.setAttribute('mxh', '100');
    Layouter.setMaxHeight(myDiv);
    expect(myDiv.classList.contains('mxh-100')).toBeTruthy();
  });

  it('With breakpoints', () => {
    const myDiv = document.createElement('div');
    myDiv.setAttribute('mxh', '100 200@sm 300@md');
    Layouter.setMaxHeight(myDiv);
    ['mxh-100', 'mxh-200@sm', 'mxh-300@md'].forEach(item => {
      expect(myDiv.classList.contains(item)).toBeTruthy();
    });
  });
});