const	{describe, it, before, afterEach} = require('mocha');
const {expect} = require('chai');
const {createSandbox} = require('sinon');

const TodoRepository = require('../../src/repositories/todoRepository');
const mockDatabase = require('../mock/mockDatabase.json')

describe('TodoRepository', () => {
	let todoRepository;
	let sandbox;

	before(() => {
		todoRepository = new TodoRepository();
		sandbox = createSandbox();
	});


	afterEach(() => {
		sandbox.restore();
	})

	describe('methods signature', () => {
		it('should call insertOne from lokijs', () => {
			const functionName = "insertOne";
			const exportedReturn = true
			const data = {name: 'Rafael'}

			sandbox.stub(
				todoRepository.schedule,
				functionName
			).returns(exportedReturn);

			const result = todoRepository.create(data);

			expect(result).to.be.ok;
			expect(todoRepository.schedule[functionName].calledOnceWithExactly(data)).to.be.ok;
		});

		it('should call find from lokijs', () => {
			const functionName = "find";
			sandbox.stub(
				todoRepository.schedule,
				functionName
			).returns(mockDatabase);

			const result = todoRepository.list();

			expect(result).to.be.deep.equal(mockDatabase);
			expect(todoRepository.schedule[functionName].calledOnce).to.be.ok;

		});
	});
});


