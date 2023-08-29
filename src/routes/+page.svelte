<svelte:head>
	<title>GitHub API</title>
</svelte:head>

<div class="text-center">
	<h1>GitHub Contributions API</h1>

	<a href="https://gh-contributions-api.vercel.app/user/year">
		https://gh-contributions-api.vercel.app/user/year
	</a>
</div>

<style>
	:global(html, body) {
		height: 100%;
	}

	:global(body) {
		display: grid;
		place-content: center;
		font-family: sans-serif;
		color: hsl(220 10% 98%);
		background-color: hsl(220 10% 10%);
	}

	a {
		color: #fff;
	}

	.text-center {
		text-align: center;
	}
</style>
