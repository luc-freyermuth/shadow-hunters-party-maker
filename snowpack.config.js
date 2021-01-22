// Consult https://www.snowpack.dev to learn about these options
module.exports = {
  extends: "@sveltejs/snowpack-config",
  plugins: ["@snowpack/plugin-typescript"],
  mount: {
    "src/components": "/_components",
    "src/stores": "/_stores",
    "src/peer2peer": "/_peer2peer",
    "src/types": "/_types",
    "src/utils": "/_utils",
  },
  alias: {
    $components: "./src/components",
    $stores: "./src/stores",
  },
  packageOptions: {
    knownEntrypoints: ['svelte', 'copy-to-clipboard']
  }
};
