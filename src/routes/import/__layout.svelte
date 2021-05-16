<script lang="ts">
	import { Row, Col } from 'sveltestrap';
</script>

<Row>
	<Col sm="12" md={{ size: 9, offset: 1 }}>
		<slot />
	</Col>
</Row>
