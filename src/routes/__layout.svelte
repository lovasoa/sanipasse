<script context="module" lang="ts">
	export async function load(data: { url: URL }) {
		const target = 'sanipasse.ophir.dev';
		const url = new URL(data.url);
		url.host = target;
		url.port = '';
		if (data.url.hostname !== url.hostname) {
			if (new Date() >= new Date('2023-03-01')) {
				return {
					status: 302,
					redirect: url.toString()
				};
			}
		}
		return {
			status: 200,
			props: { canonical: url }
		};
	}
</script>

<script lang="ts">
	import {
		Navbar,
		NavbarBrand,
		Collapse,
		Nav,
		NavbarToggler,
		NavItem,
		NavLink,
		Container,
		Icon,
		Modal,
		ModalBody,
		ModalHeader
	} from 'sveltestrap';
	import { page } from '$app/stores';
	let isOpen = false;
	let hide_menu = false;
	export let canonical: string | undefined = undefined;
	const onupdate = (e: any) => (isOpen = e.detail.isOpen);
	$: hide_menu = $page.url.pathname === '/borne';
</script>

<svelte:head>
	<title>Sanipasse - vérification de pass sanitaire</title>
	{#if canonical}
		<link rel="canonical" href={canonical} />
	{/if}
</svelte:head>

{#if !hide_menu}
	<Navbar color="light" light expand="md">
		<NavbarBrand href="/">
			<Icon name="calendar2-check" />
			Sanipasse
		</NavbarBrand>
		<NavbarToggler on:click={() => (isOpen = !isOpen)} class="me-2" />
		<Collapse {isOpen} navbar expand="md" on:update={onupdate}>
			<Nav navbar class="ms-auto">
				{#if canonical}
					<NavItem>
						<NavLink class="text-danger border-dager" href="/migration">⚠️ Migration</NavLink>
					</NavItem>
				{/if}
				<NavItem>
					<NavLink href="/articles">Articles</NavLink>
				</NavItem>
				<NavItem>
					<NavLink href="/apropos">À propos</NavLink>
				</NavItem>
			</Nav>
		</Collapse>
	</Navbar>
{/if}

<Modal isOpen={!!canonical} toggle={() => (canonical = undefined)}>
	<ModalHeader>Note importante</ModalHeader>
	<ModalBody>
		<p>
			<code>sanipasse.fr</code> migre vers
			<a href="https://sanipasse.ophir.dev"><code>sanipasse.ophir.dev</code></a>
		</p>
		<p><a href="https://sanipasse.ophir.dev/migration">Plus d'informations</a></p>
	</ModalBody>
</Modal>

<main class="w-100 px-2 px-sm-5">
	<Container>
		<slot />
	</Container>
</main>

<style>
	@import 'bootstrap/dist/css/bootstrap.min.css';
	@import 'bootstrap-icons/font/bootstrap-icons.css';

	main {
		height: 90vh;
		align-items: center;
		display: flex;
		justify-content: center;
		flex-direction: column;
		margin: 20px;
		flex-flow: wrap;
		max-width: 1024px;
		margin: auto;
		margin-top: 10px;
	}
</style>
