<script lang="ts">
    import { hostlist } from "$lib/data/hostlist";
</script>

<div class="mt-8 flex justify-center text-center">
	<div class="prose lg:prose-lg">
		<h1>Hello, this is my test site.</h1>
		<p>
			I selfhost various things on the subdomains of this site, most of which are run on single
			Raspberry Pi 4.
		</p>
		<p>I also host various experiments on this site.</p>
		<p>Here is a non-exhaustive list of some of the things I host on this site:</p>
		<ul>
            {#each hostlist as host}
                <li class="self-center">
					<a href={host.url}>{host.name}</a>
                    <p>{host.description}</p>
                </li>
            {/each}
		</ul>
	</div>
</div>

<style lang="postcss">
	li p {
		margin: 0;
    }
</style>
