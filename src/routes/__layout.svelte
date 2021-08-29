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
		Icon
	} from 'sveltestrap';
	import { page } from '$app/stores';
	let isOpen = false;
	let hide_menu = false;
	const onupdate = (e: any) => (isOpen = e.detail.isOpen);
	$: hide_menu = $page.path === '/borne';
</script>

<svelte:head>
	<title>Sanipasse - vérification de pass sanitaire</title>
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
