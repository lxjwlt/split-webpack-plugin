"use strict";

const Module = require("webpack/lib/Module");
const RawSource = require("webpack-sources").RawSource;
const Dependency = require('webpack/lib/Dependency');

class EnsureModule extends Module {

	constructor (options) {
		super();
		this._oldEntryModule = options.oldEntryModule;
		this.context = options.context;
		this.name = options.name;
		this.ensureChunks = options.chunks;
		this.built = false;

		// fake dependencies to insert __webpack_require__
        this.dependencies = [new Dependency()];
	}

	identifier () {
		return `ensure ${this.name}`;
	}

	readableIdentifier () {
		return `ensure ${this.name}`;
	}

	disconnect() {
		this.built = false;
		super.disconnect();
	}

	build (options, compilation, resolver, fs, callback) {
		this.built = true;
		return callback();
	}

	_parseRawSource (withInfo) {
		let ensureChunks = this.ensureChunks;
		let source = [
			'var all = [];'
		];

		for (let chunk of ensureChunks) {
		    let chunkInfo = withInfo ? `/*! ${chunk.id}.js */` : '';
			source.push(
				`all.push(__webpack_require__.e(${chunkInfo}${chunk.id}).catch(__webpack_require__.oe));`
			);
		}

		let oldEntryModuleInfo = withInfo ?
            `/*! ${this._oldEntryModule.rawRequest} */` : '';

		source.push(
			`Promise.all(all).then(function () {`,
			`    __webpack_require__(${oldEntryModuleInfo}${this._oldEntryModule.id})`,
			`}).catch(__webpack_require__.oe)`
		);

		return source.join('\n');
	}

	source (template, outputOptions) {
		this._source = new RawSource(this._parseRawSource(outputOptions.pathinfo));
		return this._source;
	}

	size () {
		return this._source ? this._source.size() : -1;
	}
}

module.exports = EnsureModule;
