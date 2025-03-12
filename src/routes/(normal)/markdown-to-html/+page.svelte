<script lang="ts">
	import {
		Textarea,
		Label,
		Button,
		Dropdown,
		DropdownItem,
		Checkbox,
		Toast
	} from 'flowbite-svelte';
	import { fly } from 'svelte/transition';

	import rehypeSanitize from 'rehype-sanitize';
	import rehypeStringify from 'rehype-stringify';
	import remarkParse from 'remark-parse';
	import remarkRehype from 'remark-rehype';
	import remarkGfm from 'remark-gfm';
	import { unified } from 'unified';

	let alerts: {
		text: string;
		color:
			| 'dark'
			| 'red'
			| 'yellow'
			| 'green'
			| 'indigo'
			| 'purple'
			| 'pink'
			| 'blue'
			| 'primary'
			| 'none';
		icon: string;
	}[] = $state([]);

	let conversionOptions = $state({
		gfm: true,
		sanitize: false
	});

	let inputValue = $state('');
	let outputValue = $state('');

	function convert() {
		try {
			let u = unified().use(remarkParse).use(remarkRehype).use(rehypeStringify);
			if (conversionOptions.gfm) {
				u.use(remarkGfm);
			}
			if (conversionOptions.sanitize) {
				u.use(rehypeSanitize);
			}

			outputValue = u.processSync(inputValue).toString();

			alerts.push({ text: 'Conversion successful', color: 'green', icon: 'nrk:check' });
		} catch (e) {
			outputValue = e;
			alerts.push({ text: e, color: 'red', icon: 'nrk:close' });
		}
	}
</script>

<div class="flex min-h-screen flex-col items-center justify-between gap-4 px-4 md:flex-row">
	<!-- Left Section -->
	<div class="flex flex-1 flex-col items-center justify-center space-y-2">
		<Label for="markdown-input">Markdown</Label>
		<Textarea
			id="markdown-input"
			rows={8}
			name="markdown"
			class="max-h-[70vh] w-full resize-none overflow-auto p-4"
			bind:value={inputValue}
		/>
	</div>

	<!-- Center Section -->
	<div class="flex flex-col items-center justify-center gap-2">
		<Button on:click={convert}>Convert</Button>
		<Button>Settings</Button>
		<Dropdown class="w-44 space-y-3 p-3 text-sm">
			<li>
				<Checkbox bind:checked={conversionOptions.gfm}>Github flavored markdown</Checkbox>
			</li>
			<li>
				<Checkbox bind:checked={conversionOptions.sanitize}>Clean output HTML</Checkbox>
			</li>
		</Dropdown>
	</div>

	<!-- Right Section -->
	<div class="flex flex-1 flex-col items-center justify-center space-y-2">
		<Label for="html-output">HTML</Label>
		<Textarea
			id="html-output"
			rows={8}
			name="html"
			class="max-h-[70vh] w-full resize-none overflow-auto p-4"
			readonly={true}
			bind:value={outputValue}
		/>
	</div>
</div>

<div class="toast-container">
	{#each alerts as alert}
		<Toast transition={fly} params={{ x: 200 }} color={alert.color} class="mb-4">
			<iconify-icon icon={alert.icon} slot="icon"></iconify-icon>
			{alert.text}
		</Toast>
	{/each}
</div>

<style>
	.toast-container {
		position: fixed;
		right: 1rem;
		bottom: 1rem;
	}
</style>
