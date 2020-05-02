<style>
  main {
    flex: 1;
  }

  @media screen and (max-width: 768px) {
    img {
      max-width: 50%;
    }
  }

  @media screen and (min-width: 769px) {
    img {
      max-width: 15%;
    }
  }
</style>

<div class="header is-center">
  <a href="/">
    <img src="images/logo.webp" alt="shadow hunters logo" />
  </a>
</div>
<main>
  <slot />
</main>
