<script context="module">
    export async function preload(page, session) {
		// the `slug` parameter is available because this file
		// is called [slug].svelte
		const { slug } = page.params;

		return { slug };
	}
</script>

<script>
    export let slug;
</script>

{slug}