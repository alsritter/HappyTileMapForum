<template>
  <div>
    <basic-panel>
      <template #header>
        开发日志
      </template>
      
      <template>
        <h1>todo</h1>
      </template>
    </basic-panel>
  </div>
</template>

<script>
  import BasicPanel from '@components/common/panel/BasicPanel'
  
  export default{
    name: 'about',
    components: {
      BasicPanel
    }
  }
</script>

<style>
</style>
