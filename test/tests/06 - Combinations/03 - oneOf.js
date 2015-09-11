describe("Combinators 03", function () {

	it("oneOf success", function () {
		var data = 5;
		var schema = {
			"oneOf": [
				{"type": "integer"},
				{"type": "string"},
				{"type": "string", minLength: 1}
			]
		};
		var valid = tv4.validate(data, schema);
		assert.isTrue(valid);
	});

	it("oneOf failure (too many)", function () {
		var data = "string";
		var schema = {
			"oneOf": [
				{"type": "integer"},
				{"type": "string"},
				{"minLength": 1}
			]
		};
		var valid = tv4.validate(data, schema);
		assert.isFalse(valid);
	});

	it("oneOf failure (no matches)", function () {
		var data = false;
		var schema = {
			"oneOf": [
				{"type": "integer"},
				{"type": "string"},
				{"type": "string", "minLength": 1}
			]
		};
		var valid = tv4.validate(data, schema);
		assert.isFalse(valid);
	});

	it('oneOf failure (prop missing)', function () {
		var data = {checkin: '2015-09-11', checkout: '2015-09-13'};
		var schema = {
			"oneOf": [{
				type: 'object',

				properties: {
					city: {type: 'string'},
					checkin: {type: 'string', format: 'date'},
					checkout: {type: 'string', format: 'date'}
				},

				required: ['city', 'checkin', 'checkout']
			}, {
				type: 'object',

				properties: {
					regionid: {type: 'string'},
					checkin: {type: 'string', format: 'date'},
					checkout: {type: 'string', format: 'date'}
				},

				required: ['regionid', 'checkin', 'checkout']
			}]
		};
		var valid = tv4.validate(data, schema);
		assert.isFalse(valid);
	});

	describe("in a more involved scenario", function () {
		var api;

		beforeEach(function () {
			api = tv4.freshApi();

			api.addSchema('http://127.0.0.1:3002/schema', {
				$schema: 'http://json-schema.org/draft-04/schema#',
				id: 'http://127.0.0.1:3002/schema#',

				definitions: {
					cityQuery: {
						type: 'object',

						properties: {
							city: {type: 'string'},
							checkin: {type: 'string', format: 'date'},
							checkout: {type: 'string', format: 'date'}
						},

						required: ['city', 'checkin', 'checkout']
					},

					regionQuery: {
						type: 'object',

						properties: {
							regionid: {type: 'string'},
							checkin: {type: 'string', format: 'date'},
							checkout: {type: 'string', format: 'date'}
						},

						required: ['regionid', 'checkin', 'checkout']
					},

					query: {
						type: 'object',

						oneOf: [
							{$ref: '#/definitions/cityQuery'},
							{$ref: '#/definitions/regionQuery'}
						]
					}
				}
			});
		});

		it('accepts a city query', function () {
			var result = api.validateResult({
				city: 'Winterthur',
				checkin: '2015-09-11',
				checkout: '2015-09-13'
			}, 'http://127.0.0.1:3002/schema#/definitions/cityQuery');

			assert.ok(result.valid, JSON.stringify(result));
		});

		it('rejects an incomplete query', function () {
			var result = api.validateResult({
				checkin: '2015-09-11',
				checkout: '2015-09-13'
			}, 'http://127.0.0.1:3002/schema#/definitions/query');

			assert.notOk(result.valid, 'Both city and regionid props are missing; must be invalid');
		});
	});
});
