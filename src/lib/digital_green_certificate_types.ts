/*
 Types generated with:
    $ tmp_file=$(mktemp)
    $ npm run quicktype \
        --src https://raw.githubusercontent.com/ehn-dcc-development/ehn-dcc-schema/release/1.3.0/DCC.combined-schema.json \
        --src-lang schema \
        --lang typescript \
        --just-types \
        --top-level HCert \
        --out ${tmp_file}
    $ sed -i -e 's/: Date;/: string;/g'
    $ sed -i -e 's/interface HCERT/interface HCert/g' ${tmp_file}
    $ cat ${tmp_file}
*/

/**
 * EU Digital Covid Certificate
 */
export interface HCert {
	/**
	 * Date of Birth of the person addressed in the DCC. ISO 8601 date format restricted to
	 * range 1900-2099 or empty
	 */
	dob: string;
	/**
	 * Surname(s), forename(s) - in that order
	 */
	nam: Nam;
	/**
	 * Recovery Group
	 */
	r?: RElement[];
	/**
	 * Test Group
	 */
	t?: TElement[];
	/**
	 * Vaccination Group
	 */
	v?: VElement[];
	/**
	 * Version of the schema, according to Semantic versioning (ISO, https://semver.org/ version
	 * 2.0.0 or newer)
	 */
	ver: string;
}

/**
 * Surname(s), forename(s) - in that order
 *
 * Person name: Surname(s), forename(s) - in that order
 */
export interface Nam {
	/**
	 * The surname or primary name(s) of the person addressed in the certificate
	 */
	fn?: string;
	/**
	 * The surname(s) of the person, transliterated ICAO 9303
	 */
	fnt: string;
	/**
	 * The forename(s) of the person addressed in the certificate
	 */
	gn?: string;
	/**
	 * The forename(s) of the person, transliterated ICAO 9303
	 */
	gnt?: string;
}

/**
 * Recovery Entry
 */
export interface RElement {
	/**
	 * Unique Certificate Identifier, UVCI
	 */
	ci: string;
	/**
	 * Country of Test
	 */
	co: string;
	/**
	 * ISO 8601 complete date: Certificate Valid From
	 */
	df: string;
	/**
	 * ISO 8601 complete date: Certificate Valid Until
	 */
	du: string;
	/**
	 * ISO 8601 complete date of first positive NAA test result
	 */
	fr: string;
	/**
	 * Certificate Issuer
	 */
	is: string;
	tg: string;
}

/**
 * Test Entry
 */
export interface TElement {
	/**
	 * Unique Certificate Identifier, UVCI
	 */
	ci: string;
	/**
	 * Country of Test
	 */
	co: string;
	/**
	 * Certificate Issuer
	 */
	is: string;
	/**
	 * RAT Test name and manufacturer
	 */
	ma?: string;
	/**
	 * NAA Test Name
	 */
	nm?: string;
	/**
	 * Date/Time of Sample Collection
	 */
	sc: string;
	/**
	 * Testing Centre
	 */
	tc?: string;
	tg: string;
	/**
	 * Test Result
	 */
	tr: string;
	/**
	 * Type of Test
	 */
	tt: string;
}

/**
 * Vaccination Entry
 */
export interface VElement {
	/**
	 * Unique Certificate Identifier: UVCI
	 */
	ci: string;
	/**
	 * Country of Vaccination
	 */
	co: string;
	/**
	 * Dose Number
	 */
	dn: number;
	/**
	 * ISO8601 complete date: Date of Vaccination
	 */
	dt: string;
	/**
	 * Certificate Issuer
	 */
	is: string;
	/**
	 * Marketing Authorization Holder - if no MAH present, then manufacturer
	 */
	ma: string;
	/**
	 * vaccine medicinal product
	 */
	mp: string;
	/**
	 * Total Series of Doses
	 */
	sd: number;
	/**
	 * disease or agent targeted
	 */
	tg: string;
	/**
	 * vaccine or prophylaxis
	 */
	vp: string;
}

export type DigitalGreenCertificate = HCert;
