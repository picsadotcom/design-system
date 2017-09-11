// Copyright (c) 2015-present, salesforce.com, inc. All rights reserved
// Licensed under BSD 3-Clause - see LICENSE.txt or git.io/sfdc-license

/* eslint-env jest */

const {ui} = require("../");
const I = require("immutable");
const createInstance = require("../../lib.js");
const showcase = require("../../ui/showcase.js");
const React = require("react");
const ReactDOM = require("react-dom/server");

describe("scripts/lib.js", () => {
  let uiJson, SLDS;

  beforeAll(() => {
    ui().fork(
      e => {
        throw e;
      },
      r => {
        uiJson = r
        SLDS = createInstance(uiJson)
      }
    );
  });

  it("returns a list of components", () => {
    const comps = SLDS.components()
    expect(comps.count()).toBeGreaterThan(1)
    expect(comps.first()).toEqual('buttons')
  });

  it("returns a component", () => {
    const comp = SLDS.component('buttons').getOrElse(null)
    expect(comp.get('id')).toEqual('buttons')
    expect(comp.get('restrictees').count()).toBeGreaterThan(0)
  });

  it("finds a variant", () => {
    const comp = SLDS.component('buttons').getOrElse(null)
    const variant = SLDS.findVariant(comp, 'stateful').getOrElse(null)
    expect(variant.get('id')).toEqual('stateful')
    expect(variant.get('restrictees').count()).toBeGreaterThan(0)
  });

  it("gets every example in the system", () => {
    const allMarkup =
    uiJson.flatMap((group, name) =>
      group.map(item =>
        SLDS.variants(item)
        .flatMap(variant =>
          showcase(item.get('id'), variant.get('id'), name === 'utilities', true)
          .getOrElse(I.List())
          .flatMap(section =>
            section.get('items')
            .map(i =>
              React.isValidElement(i.get('element'))
              ? ReactDOM.renderToStaticMarkup(i.get('element'))
              : `FAILED: ${item.get('id')}/${variant.get('id')}/${i.get('id')}`
            )
          )
        )
      )
    )
    expect(allMarkup).toMatchSnapshot();
  })
});
