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
	let isOpen = false;
	const onupdate = (e: any) => (isOpen = e.detail.isOpen);
</script>

<svelte:head>
	<title>Sanipasse - vérification de pass sanitaire</title>
</svelte:head>

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

<main>
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
		width: 85%;
		max-width: 1024px;
		margin: auto;
		margin-top: 10px;
	}
</style>
