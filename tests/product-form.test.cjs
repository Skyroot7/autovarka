const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const test = require('node:test');
const ts = require('typescript');
const React = require('react');

const filename = path.resolve(__dirname, '../components/admin/ProductForm.tsx');
const products = JSON.parse(readFileSync(path.resolve(__dirname, '../lib/productsData.json'), 'utf8'));
const jsx = ts.transpileModule(readFileSync(filename, 'utf8'), {
  fileName: filename,
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
}).outputText;

// Exercise the component's own event handlers and state using an isolated hook
// adapter. No browser, production action, upload or delete can be called.
function fixture(product = products[0], { isSubmitting = false } = {}) {
  const slots = [];
  let cursor = 0;
  const saved = [];
  const calls = { uploads: 0, deletes: 0, cancelled: 0 };
  const reactAdapter = {
    ...React,
    useState(initial) {
      const index = cursor++;
      if (!(index in slots)) slots[index] = typeof initial === 'function' ? initial() : initial;
      return [slots[index], value => { slots[index] = typeof value === 'function' ? value(slots[index]) : value; }];
    },
  };
  const loaded = { exports: {} };
  vm.runInNewContext(jsx, {
    module: loaded, exports: loaded.exports,
    require(name) {
      if (name === 'react') return reactAdapter;
      if (name === 'next/image') return { __esModule: true, default: 'img' };
      if (name === '@/lib/imageLimits') return { MAX_IMAGE_BYTES: 4 * 1024 * 1024 };
      if (name === '@/lib/imageActions') return {
        async uploadImage() { calls.uploads++; return { success: true, url: '/images/new-fixture.png' }; },
        async deleteImage() { calls.deletes++; throw new Error('Deletion must not happen while editing a draft'); },
      };
      return require(name);
    },
    FormData, File, console: { error() {} },
  }, { filename });
  const props = {
    product: product ? structuredClone(product) : undefined,
    onSave: value => saved.push(structuredClone(value)),
    onCancel: () => { calls.cancelled++; },
    isSubmitting,
  };
  let tree;
  const render = () => { cursor = 0; tree = loaded.exports.default(props); return tree; };
  function all(predicate, ...nodes) {
    const node = nodes.length ? nodes[0] : tree;
    if (Array.isArray(node)) return node.flatMap(child => all(predicate, child));
    if (!React.isValidElement(node)) return [];
    return [...(predicate(node) ? [node] : []), ...all(predicate, node.props.children)];
  }
  function field(name) {
    const [element] = all(element => element.props.name === name);
    assert.ok(element, `field ${name}`);
    return element;
  }
  function change(name, value) {
    field(name).props.onChange({ target: { value } });
    render();
  }
  function submit() { tree.props.onSubmit({ preventDefault() {} }); render(); }
  render();
  return { render, all, field, change, submit, saved, calls, props };
}

test('product editing preserves existing translations, commercial values and additional specifications', () => {
  const product = { ...products[0], specifications: { ...products[0].specifications, dimensions: 'fixture dimensions', material: 'fixture material' } };
  const f = fixture(product);
  f.change('name', product.name + ' edited');
  f.submit();
  assert.equal(f.saved.length, 1);
  const value = f.saved[0];
  for (const key of ['nameEn', 'nameRu', 'namePl', 'nameDe', 'description', 'descriptionEn', 'descriptionRu', 'descriptionPl', 'descriptionDe', 'price', 'inStock']) {
    assert.equal(value[key], product[key], key);
  }
  assert.deepEqual(value.images, product.images);
  assert.equal(value.specifications.dimensions, 'fixture dimensions');
  assert.equal(value.specifications.material, 'fixture material');
  assert.equal(f.calls.deletes, 0);
});

test('new products require explicit names and descriptions on all five languages without copying Ukrainian', () => {
  const f = fixture(null);
  for (const key of ['name', 'description', 'nameEn', 'descriptionEn', 'nameRu', 'descriptionRu']) f.change(key, `Entered ${key}`);
  f.submit();
  assert.equal(f.saved.length, 0);
  assert.equal(f.field('namePl').props.value, '');
  assert.equal(f.field('descriptionDe').props.value, '');
  assert.equal(f.all(element => element.props.role === 'alert').length, 1);
  for (const key of ['namePl', 'descriptionPl', 'nameDe', 'descriptionDe']) f.change(key, `Entered ${key}`);
  f.submit();
  assert.equal(f.saved.length, 1);
  assert.equal(f.saved[0].namePl, 'Entered namePl');
  assert.equal(f.saved[0].descriptionDe, 'Entered descriptionDe');
});

test('whitespace-only translations block submission rather than overwriting data', () => {
  const f = fixture();
  f.change('descriptionPl', ' \n\t ');
  f.submit();
  assert.equal(f.saved.length, 0);
  assert.equal(f.all(element => element.props.role === 'alert').length, 1);
});

test('removing a photo edits only the draft and cancelling never deletes the saved asset', () => {
  const f = fixture();
  const remove = f.all(element => element.type === 'button' && element.props.title === 'Убрать из карточки')[0];
  assert.ok(remove, 'image removal button');
  remove.props.onClick();
  f.render();
  assert.equal(f.calls.deletes, 0);
  assert.equal(f.saved.length, 0);
  const cancel = f.all(element => element.type === 'button' && element.props.onClick === f.props.onCancel)[0];
  cancel.props.onClick();
  assert.equal(f.calls.cancelled, 1);
  assert.deepEqual(f.props.product.images, products[0].images);
});

test('submitting and oversized upload guards prevent state-changing actions', async () => {
  const busy = fixture(products[0], { isSubmitting: true });
  busy.submit();
  assert.equal(busy.saved.length, 0);
  const f = fixture();
  const upload = f.all(element => element.type === 'input' && element.props.type === 'file')[0];
  const event = { target: { files: [{ size: 4 * 1024 * 1024 + 1 }], value: 'fixture-file' } };
  await upload.props.onChange(event);
  assert.equal(f.calls.uploads, 0);
  assert.equal(event.target.value, '');
});
