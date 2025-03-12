<script lang="ts">
	import { onMount } from 'svelte';
	import { getAllAV1Codecs, getAllAVCCodecs, getAllHEVCCodecs, getAllVP9Codecs } from './codecs';

	type ResultType = {
		name: string;
		// The result type. If it is a boolean it will be rendered as a tick or cross. If it is a number it will be a percentage of the 'total' value.
		type?: 'boolean' | 'string' | 'number';
		supported: boolean | string | number;
		// Has no effect if the result type is not a number
		total?: number;
	};

	type SectionType = {
		id: string;
		name: string;
		description: string;
		note: string;
		results?: ResultType[];
	};

	class Results {
		sections: SectionType[] = [];
		addSection(id: string, name: string, description: string, note?: string) {
			this.sections.push({
				id: id,
				name: name,
				description: description,
				note: note,
				results: []
			});
		}
		addFormat(sectionId: string, resultData: ResultType) {
			// Find the section
			const section = this.sections.find((section) => section.id === sectionId);
			if (section) {
				// Add the result
				section.results.push(resultData);
			}
		}
	}

	let results = new Results();
	let isChecking = true;

	const imageFormats: { name: string; mime: string }[] = [
		{ name: 'AVIF', mime: 'avif' },
		{ name: 'WEBP', mime: 'webp' },
		{ name: 'JPEG', mime: 'jpeg' },
		{ name: 'PNG', mime: 'png' },
		{ name: 'GIF', mime: 'gif' },
		{ name: 'BMP', mime: 'bmp' },
		{ name: 'ICO', mime: 'vnd.microsoft.icon' },
		{ name: 'SVG', mime: 'svg+xml' },
		{ name: 'HEIC', mime: 'heic' },
		{ name: 'HEIF', mime: 'heif' },
		{ name: 'TIFF', mime: 'tiff' },
		{ name: 'JPEG XL', mime: 'jxl' }
	];

	async function checkImageFormat(format: string): Promise<boolean> {
		return new Promise((resolve) => {
			const img = new Image();
			img.src = `data:image/${format};base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=`;
			img.onload = () => resolve(true);
			img.onerror = () => resolve(false);
		});
	}

	onMount(async () => {
		// Check image formats
		const imageResults = await Promise.all(
			imageFormats.map(async (format) => checkImageFormat(format.mime))
		);
		results.addSection(
			'image',
			'Image Formats',
			'Image formats detected using data URIs',
			'This tends to be pretty inaccurate'
		);
		imageFormats.forEach((format, i) => {
			results.addFormat('image', {
				name: format.name,
				type: 'boolean',
				supported: imageResults[i]
			});
		});

		results.addSection('video.codecs', 'Video Codecs', 'Video codecs detected using MediaSource.isTypeSupported(). The larger the number displayed the more variations of the codec are supported.');
		const av1Codecs = getAllAV1Codecs();
		const avcCodecs = getAllAVCCodecs();
		const hevcCodecs = getAllHEVCCodecs();
		const vp9Codecs = getAllVP9Codecs();
		let av1CodecsSupported = 0;
		let avcCodecsSupported = 0;
		let hevcCodecsSupported = 0;
		let vp9CodecsSupported = 0;

		av1Codecs.forEach((codec) => {
			const supported = MediaSource.isTypeSupported(`video/mp4; codecs="${codec.codec}"`);
			if (supported) {
				av1CodecsSupported++;
			}
		});

		avcCodecs.forEach((codec) => {
			const supported = MediaSource.isTypeSupported(`video/mp4; codecs="${codec.codec}"`);
			if (supported) {
				avcCodecsSupported++;
			}
		});

		hevcCodecs.forEach((codec) => {
			const supported = MediaSource.isTypeSupported(`video/mp4; codecs="${codec.codec}"`);
			if (supported) {
				hevcCodecsSupported++;
			}
		});

		vp9Codecs.forEach((codec) => {
			const supported = MediaSource.isTypeSupported(`video/mp4; codecs="${codec.codec}"`);
			if (supported) {
				vp9CodecsSupported++;
			}
		});

		results.addFormat('video.codecs', {
			name: 'AV1',
			type: 'number',
			supported: av1CodecsSupported,
			total: av1Codecs.length
		});
		results.addFormat('video.codecs', {
			name: 'AVC',
			type: 'number',
			supported: avcCodecsSupported,
			total: avcCodecs.length
		});
		results.addFormat('video.codecs', {
			name: 'HEVC',
			type: 'number',
			supported: hevcCodecsSupported,
			total: hevcCodecs.length
		});
		results.addFormat('video.codecs', {
			name: 'VP9',
			type: 'number',
			supported: vp9CodecsSupported,
			total: vp9Codecs.length
		});

		isChecking = false;
	});
</script>

<div class="min-h-screen bg-gray-100 px-4 py-8">
	<div class="mx-auto max-w-2xl space-y-6">
		<h1 class="text-center text-3xl font-bold text-gray-900">Browser Format Support Checker</h1>

		{#if isChecking}
			<div class="text-center text-gray-600">Checking supported formats...</div>
		{:else}
			{#each results.sections as section}
				<div class="rounded-lg bg-white p-6 shadow">
					<h2 class="mb-4 text-xl font-semibold">{section.name}</h2>
					<p class="mb-2 text-center text-gray-600">{section.description}</p>
					{#if section.note}
						<p class="mb-2 text-center text-yellow-600">{section.note}</p>
					{/if}
					<ul class="space-y-2">
						{#each section.results as format}
							{#if format.type === 'boolean'}
							<li
								class="flex items-center justify-between rounded-lg p-3 {format.supported
									? 'bg-green-50'
									: 'bg-red-50'}"
							>
								<span class="font-medium">{format.name}</span>
								<div class="flex items-center space-x-2">
									<div
										class={`h-2 w-2 rounded-full ${format.supported ? 'bg-green-500' : 'bg-red-500'}`}
									/>
									<span class={format.supported ? 'text-green-700' : 'text-red-700'}>
										{format.supported ? 'Supported' : 'Not Supported'}
									</span>
								</div>
							</li>
							{:else if format.type === 'number' && typeof format.supported === 'number'}
							<li
								class="flex items-center justify-between rounded-lg p-3"
								style="background-color: hsl({(format.supported / format.total) * 120}, 100%, 90%)"
							>
								<span class="font-medium">{format.name}</span>
								<div class="flex items-center space-x-2">
									<div
										style="background-color: hsl({(format.supported / format.total) * 120}, 100%, 50%)"
										class="h-2 w-2 rounded-full"
									/>
									<span class="text-gray-700">
										{format.supported}/{format.total}
									</span>
								</div>
							</li>
							{/if}
						{/each}
					</ul>
				</div>
			{/each}
		{/if}
	</div>
</div>
