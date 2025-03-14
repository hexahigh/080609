<!-- <script context="module">
	import { options } from './../../../.svelte-kit/generated/server/internal.js';
	import { MetaTags } from 'svelte-meta-tags';
	import { asciiLogo } from './../../lib/js/config.js';
	export const prerender = true
</script> -->
<script lang="ts">
	import type { StdlibType, CommandType, CommandsType, LineDataEntry } from './types';

	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { MetaTags } from 'svelte-meta-tags';
	import Fuse from 'fuse.js';
	import axios from 'axios';

	import { lore } from './lore.js';
	import { dateTime, history } from './stores.js';
	import { parseFlags } from './args.js';
	import './style.css';
	let { data } = $props();

	const user = 'root';
	const machine = $page.url.host || 'localhost';

	let lineData: LineDataEntry[] = $state([]);
	let histIndex = $history.length;
	let showInput = $state(true);
	let hideStuff = $state(false);

	let termInput: any = $state();
	let terminalContainer: any = $state();

	let inputMode = 'default';

	function enter() {
		let command = termInput.value;
		lineData = [...lineData, { command: command, type: 'input' }];
		if (inputMode === 'default') {
			handle(command);
		}
		if (inputMode === 'confirmExec' && data.commandToRun) {
			if (command == 'CONFIRM' || command == 'confirm') {
				handle(data.commandToRun);
			} else {
				print('Not running');
			}
			inputMode = 'default';
		}
		termInput.value = '';

		if (command === '' || /^[ ]+$/.test(command) || $history[$history.length - 1] === command)
			return;

		$history[$history.length] = command;
		histIndex = $history.length;
	}

	function arrowUp() {
		if (histIndex === 0) return;

		histIndex--;
		termInput.value = $history[histIndex];
	}

	function arrowDown() {
		if (histIndex < $history.length - 1) {
			histIndex++;
			termInput.value = $history[histIndex];
		} else {
			histIndex = $history.length;
			termInput.value = '';
		}
	}

	function handleKeypress(e: KeyboardEvent) {
		switch (e.key) {
			case 'ArrowUp':
				arrowUp();
				break;
			case 'ArrowDown':
				arrowDown();
				break;
			case 'Enter':
				enter();
				break;
		}
	}

	function print(...args: any[]) {
		// Concatenate all arguments into a single string with newlines
		lineData = [...lineData, { output: args.join('\n'), type: 'output' }];
		scroll(0);

		// We call scroll again to ensure that the new lines are visible
		scroll(100);
	}

	async function scroll(wait) {
		await new Promise((resolve) => setTimeout(resolve, wait || 0));
		if (terminalContainer) {
			terminalContainer.scrollTop = terminalContainer.scrollHeight;
		}
	}

	const handle = (text) => {
		// Helper function to parse arguments with spaces
		const parseArgs = (text) => {
			const args = [];
			let currentArg = '';
			let inString = false;
			let stringType = null;

			for (let i = 0; i < text.length; i++) {
				const char = text[i];

				// Handle escape characters
				if (char === '\\' && !inString) {
					const nextChar = text[++i];
					switch (nextChar) {
						case '"':
						case "'":
						case '\\':
							currentArg += nextChar;
							break;
						default:
							currentArg += '\\' + nextChar;
					}
					continue;
				}

				// Handle string quotes
				if ((char === '"' || char === "'") && !inString) {
					stringType = char;
					inString = true;
					continue;
				}

				if (char === stringType && inString) {
					inString = false;
					stringType = null;
					continue;
				}

				// Handle spaces outside quotes
				if (char === ' ' && !inString) {
					if (currentArg.trim()) {
						args.push(currentArg);
						currentArg = '';
					}
					continue;
				}

				currentArg += char;
			}

			// Add the last argument if it exists
			if (currentArg.trim()) {
				args.push(currentArg);
			}

			return args;
		};

		// Parse the command line
		const parts = parseArgs(text.trim());
		const command = parts.shift();
		const args = parts;

		// Find the command in the commands array
		const foundCommand = commands.find((cmd) => cmd.name === command);

		if (foundCommand) {
			// Execute the found command
			return foundCommand.execute(args);
		} else {
			const options = { keys: ['name'] };
			const fuse = new Fuse(commands, options);
			const result = fuse.search(command);
			let response = `Command '${command}' not found.`;
			if (result.length > 0) {
				response += ` Did you mean ${result[0].item.name}?`;
			}
			response += `\nType 'list' to see a list of available commands.`;
			return print(response);
		}
	};

	function createHiddenCommand(name: string, description: string) {
		return {
			name: name,
			description: description,
			long_description: description,
			usage: name,
			hidden: true,
			execute: () => {
				return print(description);
			}
		};
	}

	let hiddenCommands = lore.map((item) => createHiddenCommand(item.name, item.text));

	let stdlib: StdlibType;
	$effect(() => {
		stdlib = {
			print: print,
			lineData: lineData,
			setLineData: (array: any[]) => {
				lineData = array;
			},
			setTextSize: (size: number) => {
				terminalContainer.style.fontSize = `${size}px`;
			},
			showInput: showInput,
			setShowInput: (show: boolean) => {
				showInput = show;
			},
			hideStuff: () => {
				hideStuff = true;
			},
			showStuff: () => {
				hideStuff = false;
			}
		};
	});

	let commands: CommandsType = [
		...hiddenCommands,
		{
			name: 'ping',
			description: 'ping pong',
			long_description: 'ping pong bing bong',
			usage: 'ping',
			hidden: false,
			execute: () => {
				return print('pong');
			}
		},
		{
			name: 'list',
			description: 'list available commands',
			long_description: 'Pretty self explanatory',
			usage: 'list',
			hidden: false,
			execute: () => {
				// Sort the commands alphabetically by name
				const sortedCommands = commands.sort((a, b) => a.name.localeCompare(b.name));

				// Use map to create an array of command descriptions
				const commandDescriptions = sortedCommands
					.filter((command) => !command.hidden)
					.map((command) => {
						return `- ${command.name}: ${command.description} Usage: '${command.usage}'`;
					});
				// Join the array into a single string and return it
				return print(commandDescriptions.join('\n'));
			}
		},
		{
			name: 'tsil',
			description: 'sdnammoc elbaliava tsil',
			long_description: 'yrotanalpxe fles ytterP',
			usage: 'tsil',
			hidden: true,
			execute: () => {
				// Sort the commands alphabetically by name
				const sortedCommands = commands.sort((a, b) => a.name.localeCompare(b.name));

				// Use map to create an array of command descriptions
				const commandDescriptions = sortedCommands.map((command) => {
					return `- ${command.name}`;
				});
				// Join the array into a single string and return it
				return print(commandDescriptions.join('\n'));
			}
		},
		{
			name: 'echo',
			description: 'echo text',
			long_description: 'Have you ever used a terminal?',
			usage: 'echo [text]',
			hidden: false,
			execute: (args) => {
				return print(args.join(' '));
			}
		},
		{
			name: 'fetch',
			description: 'for that arch linux flex',
			long_description: 'Neofetch like info.',
			usage: 'fetch',
			hidden: false,
			execute: async () => {
				const module = await import('./commands/fetch.js');

				module.main(print, showInput, machine);
			}
		},
		{
			name: 'help',
			description: 'Print help for a command',
			long_description: 'Prints help for a command. Did you really need to know that?',
			usage: 'help [command]',
			hidden: false,
			execute: (args) => {
				if (args.length === 0) {
					let text = [
						'Blålange festivalen blåsh, version 1.0.0',
						"Use `help <command>' for more information on a command.",
						"To view available commands, type `list'."
					];
					return print(...text);
				} else {
					const command = commands.find((command) => command.name === args[0]);
					if (command) {
						let text = [
							`${command.name}: ${command.description}`,
							`Usage: ${command.usage}`,
							`Description: ${command.long_description || ''}`
						];
						return print(...text);
					} else {
						return print('Command not found');
					}
				}
			}
		},
		{
			name: 'clear',
			description: 'Clears the terminal',
			long_description: 'Pretty self explanatory',
			usage: 'clear',
			hidden: false,
			execute: () => {
				lineData = [];
			}
		},
		{
			name: 'exec',
			description: 'execute javascript',
			long_description:
				'Executes javascript. ' +
				'You can use this to create your own commands. However, you should use execfetch if you are making something big. ' +
				'I was even nice enough to pass a few functions to it. This means you can use functions like print() directly in your code.' +
				'\n\nThe full list of functions passed is: \n' +
				'- print(string) | prints a string\n\n' +
				'You can read more about this at https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function',
			usage: 'exec [command]',
			hidden: false,
			execute: (args) => {
				showInput = false;
				try {
					const func = new Function('print', 'playSound', args.join(' '));
					func(print);
				} catch (e) {
					print(e);
				}
				showInput = true;
			}
		},
		{
			name: 'execfetch',
			description: 'fetches a javascript file from a url and executes it',
			long_description:
				"Fetches a javascript file from a url and executes it. Don't forget about the horrible curse that has been cast on all browsers, CORS.",
			usage: 'execfetch [url]',
			hidden: false,
			execute: (args) => {
				if (!args[0]) {
					print('No url provided');
					return;
				}
				showInput = false;
				try {
					axios
						.get(args[0])
						.then((response) => {
							// Find the 'exec' command object
							const execCommand = commands.find((cmd) => cmd.name === 'exec');
							if (execCommand) {
								// Call the 'exec' command's execute method with the fetched code
								execCommand.execute([response.data]);
							} else {
								print("Error: 'exec' command not found.");
							}
						})
						.catch((error) => {
							print(error);
						});
				} catch (e) {
					print(e);
				}
				showInput = true;
			}
		},
		{
			name: 'httping',
			description: 'ping a website',
			long_description: 'ping a website',
			usage: 'httping [url]',
			hidden: false,
			execute: async (args) => {
				showInput = false;
				const module = await import('./commands/httping.js');

				const options = {
					url: args[0],
					timeout: args[1]
				};

				await module.main(print, options);
				showInput = true;
			}
		},
		{
			name: 'joke',
			description: 'Outputs a random joke',
			long_description:
				'Outputs a random joke.\n' +
				'Available flags are:\n' +
				'-spicy [bool] | Enables spicy mode',
			usage: 'joke [category] <flags>',
			hidden: false,
			execute: async (args) => {
				const module = await import('./commands/joke.js');

				let options = {};

				if (args.length !== 0) {
					let flags = await parseFlags(args);

					options = {
						category: flags.args[0] || 'all',
						spicyMode: flags.flags.spicy === 'true'
					};
				}

				await module.default(print, options);
			}
		},
		{
			name: 'prime',
			description: 'Prints all primes up to a given number',
			long_description: 'Prints all primes up to a given number',
			usage: 'prime [number]',
			hidden: false,
			execute: async (args) => {
				const module = await import('./commands/prime.js');

				let options = {};

				options = {
					number: args[0]
				};

				await module.default(stdlib, options);
			}
		},
		{
			name: 'apple',
			description: 'Bad apple',
			long_description: '',
			usage: 'apple',
			hidden: false,
			execute: async (args) => {
				const module = await import('./commands/apple.js');

				let options = {};

				if (args.length !== 0) {
					let flags = await parseFlags(args);

					options = {
						speed: flags.args[0] || 1
					};
				}

				await module.default(stdlib, options);
			}
		},
		{
			name: 'apple2',
			description: 'Bad apple but using the new video format',
			long_description: '',
			usage: 'apple',
			hidden: false,
			execute: async (args) => {
				const module = await import('./commands/apple2.js');

				let options = {};

				if (args.length !== 0) {
					let flags = await parseFlags(args);

					options = {
						speed: flags.args[0] || 1
					};
				}

				await module.default(stdlib, options);
			}
		},
		{
			name: 'apple-hd',
			description: 'Bad apple in "glorious" 480p',
			long_description: '',
			usage: 'apple-hd',
			hidden: false,
			execute: async (args) => {
				const module = await import('./commands/apple-hd.js');

				let options = {};

				if (args.length !== 0) {
					let flags = await parseFlags(args);

					options = {
						speed: flags.args[0] || 1
					};
				}

				await module.default(stdlib, options);
			}
		},
		{
			name: 'pootis',
			description: '',
			long_description: 'The intro from "Pootis Engage //EXTREME"',
			usage: 'pootis',
			hidden: false,
			execute: async (args) => {
				const module = await import('./commands/pootis.js');

				let options = {};

				if (args.length !== 0) {
					let flags = await parseFlags(args);

					options = {
						speed: flags.args[0] || 1
					};
				}

				await module.default(stdlib, options);
			}
		},
		{
			name: 'beast',
			description: '',
			long_description: 'MR. BEAST!!!!',
			usage: 'beast',
			hidden: false,
			execute: async (args) => {
				const module = await import('./commands/beast.js');

				let options = {};

				if (args.length !== 0) {
					let flags = await parseFlags(args);

					options = {
						speed: flags.args[0] || 1
					};
				}

				await module.default(stdlib, options);
			}
		}
	];

	if (data.commandToRun) {
		inputMode = 'confirmExec';
		print(
			`\nYou entered a special url which will automatically run the command '${data.commandToRun}'.\n` +
				`Please CONFIRM or DENY`
		);
	}

	onMount(() => {
		termInput.focus();
	});
</script>

<MetaTags
	title="Terminal"
	titleTemplate="%s | Blålange"
	description="BlålangeOS"
	canonical="https://blalange.org/term"
	openGraph={{
		url: 'https://blalange.org/term',
		title: 'Terminal | Blålange',
		description: 'BlålangeOS',
		siteName: 'Blålange festivalen'
	}}
/>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<div
	id="terminalContainer"
	class="terminal crt pxplus-ibm-bios flex flex-col items-start"
	onclick={() => {
		if (window.getSelection().toString() === '' && termInput) {
			termInput.focus();
		}
	}}
	bind:this={terminalContainer}
>
	<pre class="output" class:hidden={hideStuff}>Welcome to Blåsh</pre>
	<pre class="output" class:hidden={hideStuff}>Type 'help' to learn more.</pre>
	{#each lineData as line, i (i)}
		<span>
			{#if line.type === 'input'}
				<p class="prompt">{user}@{machine}:$&nbsp;</p>
				<pre class="input-old">{line.command}</pre>
				<br />
			{:else if line.type === 'output'}
				<pre class="output whitespace-pre-wrap">{line.output}</pre>
			{:else if line.type === 'outputHtml'}
				{@html line.output}
			{/if}
		</span>
	{/each}
	{#if showInput && !hideStuff}
		<div class="flex items-center">
			<p class="prompt mr-auto">{user}@{machine}:$&nbsp;</p>
			<input
				class="input flex-grow"
				type="text"
				spellcheck="false"
				bind:this={termInput}
				onkeydown={handleKeypress}
			/>
		</div>
	{/if}
	<div class="clock" class:hidden={hideStuff}>{$dateTime}</div>
</div>
<div class="scanline"></div>
