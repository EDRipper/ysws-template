<script lang="ts">
  let { data } = $props();
</script>

<div class="callback-container">
  {#if data.error}
    <p class="error">Login failed: {data.error}</p>
    <a href="/">Back to home</a>
  {:else}
    <p>Redirecting...</p>
  {/if}
</div>

<style>
  .callback-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    font-family: sans-serif;
    color: var(--color-text);
    background: var(--color-bg);
  }

  .error {
    color: var(--color-danger);
  }

  a {
    color: var(--color-text);
    margin-top: 1rem;
  }
</style>
