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

describe('Buildings width', () => {
  it('simple', () => {
    expect(Layouter.buildHeight('100')).toEqual({
      "hgt-100": ".hgt-100{height:100px}"
    });
  });

  it('simple with important flag', () => {
    expect(Layouter.buildHeight('100!')).toEqual({
      "hgt-100!": ".hgt-100\\!{height:100px !important}"
    });
  });

  it('simple with units relative', () => {
    expect(Layouter.buildHeight('40vw')).toEqual({
      "hgt-40vw": ".hgt-40vw{height:40vw}"
    });
  });

  it('With breakpoints and important flag', () => {
    expect(Layouter.buildHeight('100! 200@sm 300@md!')).toEqual({
      "hgt-100!": ".hgt-100\\!{height:100px !important}",
      "hgt-200@sm": "@media screen and (min-width: 768px){.hgt-200\\@sm{height:200px}}",
      "hgt-300@md!": "@media screen and (min-width: 1024px){.hgt-300\\@md\\!{height:300px !important}}"
    })
  });
});