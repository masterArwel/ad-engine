<script>
  export let name = 'my-svelte-app';
</script>

<main>
  <h1>Hello {name}!</h1>
  <p>这是一个 Svelte 微前端应用</p>
</main>

<style>
  main {
    text-align: center;
    padding: 1em;
    max-width: 240px;
    margin: 0 auto;
  }

  h1 {
    color: #ff3e00;
    text-transform: uppercase;
    font-size: 4em;
    font-weight: 100;
  }
</style>