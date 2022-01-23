<script lang="ts">
	import type { ConfigProperties } from './config/_config';
	import { DEFAULT_CONFIG } from './config/_config';
	import { assets } from '$app/paths';

	export let valid = true;
	export let context: Record<string, any> = {};
	export let config = DEFAULT_CONFIG;

	let config_sound = valid ? config.sound_valid : config.sound_invalid;

	let get_msg = (c: ConfigProperties) => (valid ? c.accepted_message : c.refused_message);
	let config_msg = get_msg(config) || get_msg(DEFAULT_CONFIG) || '';

	const format_funcs: Record<string, (s: any) => string> = {
		first_name: (s: string) => (s[0] || '').toUpperCase() + s.slice(1).toLowerCase(),
		last_name: (s: string) => s.toUpperCase(),
		date_of_birth: (d: Date) => d.toLocaleDateString('fr')
	};

	function format(s: string) {
		return s.replace(/\$(\w+)/g, (_, param: string) => {
			let target = context[param];
			if (target && param in format_funcs) target = format_funcs[param](target);
			return typeof target === 'string' ? target : '';
		});
	}

	let [title, ...message_lines] = config_msg.split('\n\n').map(format);
</script>

{#if config_sound !== null}
	<!-- svelte-ignore a11y-media-has-caption -->
	<audio autoplay src="{assets}/{config_sound || (valid ? 'valid.mp3' : 'invalid.mp3')}" />
{/if}
<div
	class={'alert shadow ' + (valid ? 'validated_pass alert-success' : 'refused_pass alert-danger')}
	role="alert"
>
	<div class="row">
		<div class="col-md-2">
			<div class:sign={true} class:shallpass={valid} class:shallnotpass={!valid} />
		</div>
		<div class="col-md-10">
			<h3>{title}</h3>

			{#each message_lines as paragraph}
				<p>{paragraph}</p>
			{/each}
			<div class="progress">
				<div
					class="progress-bar animate"
					class:bg-danger={!valid}
					class:bg-success={valid}
					role="progressbar"
					style="animation-duration: {config.reset_after_s}s"
				/>
			</div>
		</div>
	</div>
</div>

<style>
	.progress-bar {
		width: 100%;
		transition: 100ms;
	}

	.progress-bar.animate {
		animation: reduce_width;
	}

	@keyframes reduce_width {
		to {
			width: 0%;
		}
	}

	.sign {
		border: 0.1em solid white;
		width: 5em;
		height: 5em;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.shallnotpass {
		background-color: var(--bs-danger);
	}
	.shallnotpass::after {
		content: ' ';
		display: block;
		background-color: white;
		animation: shallnotpass 0.5s;
		height: 0.8em;
		width: 65%;
	}
	@keyframes shallnotpass {
		from {
			height: 0;
			width: 0%;
		}
		to {
			height: 0.8em;
			width: 65%;
		}
	}

	.shallpass {
		background-color: var(--bs-success);
		animation: shallpass 0.8s;
	}
	.shallpass::before {
		content: ' ';
		display: block;
		background-color: white;
		height: 1em;
		width: 0.8em;
		transform: rotate(-45deg) translate(0.37em, 0.4em);
	}
	.shallpass::after {
		content: ' ';
		display: block;
		background-color: white;
		height: 0.8em;
		width: 50%;
		transform: rotate(-45deg);
	}
	@keyframes shallpass {
		from {
			transform: rotate(360deg);
		}
		to {
			transform: rotate(0);
		}
	}
</style>
