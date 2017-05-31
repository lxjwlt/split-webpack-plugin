"use strict";

const Module = require("webpack/lib/Module");
const RawSource = require("webpack-sources").RawSource;
const Dependency = require('webpack/lib/Dependency');

class EnsureModule extends Module {

	constructor(options) {
		super();
		this._oldEntryModule = options.oldEntryModule;
		this.context = options.context;
		this.name = options.name;
		this.ensureChunks = options.chunks;
		this.built = false;

		// fake dependencies to insert __webpack_require__
        this.dependencies = [new Dependency()];
	}

	identifier() {
		return `ensure ${this.name}`;
	}

	readableIdentifier() {
		return `ensure ${this.name}`;
	}

	disconnect() {
		this.built = false;
		super.disconnect();
	}

	build(options, compilation, resolver, fs, callback) {
		this.built = true;
		return callback();
	}

	_parseRawSource () {
		let ensureChunks = this.ensureChunks;
		let source = [
			'var all = [];'
		];

		for (let chunk of ensureChunks) {
			source.push(
				`all.push(__webpack_require__.e(${chunk.id}).catch(__webpack_require__.oe));`
			);
		}

		source.push(
			`Promise.all(all).then(function () {
				__webpack_require__(${this._oldEntryModule.id})
			})`
		);

		return source.join('\n');
	}

	source() {
		return new RawSource(this._parseRawSource());
	}

	size() {
		return this._parseRawSource().length;
	}
}

module.exports = EnsureModule;
