<script lang="ts">
  let enabled = $state(false);

  function handleClick(): void {
    console.log("YO");
  }
</script>

<style>
</style>

<button id="show-menu">
  Elements
</button>

<context-menu id="menu" target="#show-menu">
  <normal-menu-item id="delete" label="Delete" tooltip="Delete some stuff." onclick={handleClick}></normal-menu-item>
  <normal-menu-item id="add" label="Add"></normal-menu-item>
  <separator-menu-item></separator-menu-item>
  <normal-menu-item label="Remove" enabled={enabled}></normal-menu-item>
  <submenu-menu-item label="Checkboxes" id="checkboxes">
    <checkbox-menu-item checked="true" label="Item A"></checkbox-menu-item>
    <checkbox-menu-item label="Item B"></checkbox-menu-item>
    <checkbox-menu-item label="Item C"></checkbox-menu-item>
  </submenu-menu-item>
  <separator-menu-item></separator-menu-item>
  <submenu-menu-item label="Radio" id="radios">
    <radio-menu-item id="item-a" label="Item A"></radio-menu-item>
    <radio-menu-item label="Item B"></radio-menu-item>
    <radio-menu-item label="Item C"></radio-menu-item>
  </submenu-menu-item>
  <separator-menu-item></separator-menu-item>
  <share-menu>
    <sharing-item-entry type="url" value="https://google.com"></sharing-item-entry>
  </share-menu>
  <role-menu-item of="cut"></role-menu-item>
  <role-menu-item of="copy"></role-menu-item>
  <role-menu-item of="paste"></role-menu-item>
</context-menu>
