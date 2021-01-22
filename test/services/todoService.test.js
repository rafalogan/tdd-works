const	{describe, it, before, beforeEach, afterEach} = require('mocha');
const {expect} = require('chai');
const {createSandbox} = require('sinon');

const TodoService = require('../../src/services/todoService');
const Todo = require("../../src/todo");
const mockDatabase = require('../mock/mockDatabase.json');

describe('todoService', () => {
	let todoService;
	let sandbox;

	before(() => {
		todoService = new TodoService({});
		sandbox = createSandbox();
	});

	afterEach(() => sandbox.restore());

	describe('#list', () => {
		beforeEach(() => {
			const dependencies = {
				todoRepository: {
					list: sandbox.stub().returns(mockDatabase)
				}
			}
			todoService = new TodoService(dependencies);
		});

		it('should return data on a specific format', () => {
			const result  = todoService.list();
			const [{meta, $loki, ...expected}] = mockDatabase;

			expect(result).to.be.deep.equal([expected]);
		})
	});

	describe('#create', () => {
		beforeEach(() => {
			const dependencies = {
				todoRepository: {
					create: sandbox.stub().returns(true)
				}
			}
			todoService = new TodoService(dependencies);
		});

		it('should\'t save todo item with invalid data', () => {
			const data  = new Todo({text: '', when: ''});
			const expected = {
				error: {
					message: 'invalid data',
					data
				}
			}

			Reflect.deleteProperty(data, 'id');

			const result = todoService.create(data);

			expect(result).to.be.deep.equal(expected);

		});

		it('should save todo item with late status when the property is further than today', () => {
			const uuid = require('uuid');
			const properties = {
				text: 'I must walk my cat',
				when: new Date('2020-12-01 12:00 GMT-0')
			}
			const expectedId = '000001';
			const fakeUUID = sandbox.fake.returns(expectedId);
			sandbox.replace(uuid, 'v4', fakeUUID);
			const today = new Date("2021-01-22");
			sandbox.useFakeTimers(today.getTime());
			const data  = new Todo(properties);

			todoService.create(data);

			const expectedCallWith = {
				...data,
				status: 'late'
			}

			expect(todoService.todoRepository.create.calledOnceWithExactly(expectedCallWith)).to.be.ok

		});

		it('should save todo item with pending status', () => {
			const uuid = require('uuid');
			const properties = {
				text: 'I must walk my cat',
				when: new Date('2021-02-01 12:00 GMT-0')
			}
			const expectedId = '000001';
			const fakeUUID = sandbox.fake.returns(expectedId);
			sandbox.replace(uuid, 'v4', fakeUUID);
			const today = new Date("2021-01-22");
			sandbox.useFakeTimers(today.getTime());
			const data  = new Todo(properties);

			todoService.create(data);

			const expectedCallWith = {
				...data,
				status: 'pending'
			}

			expect(todoService.todoRepository.create.calledOnceWithExactly(expectedCallWith)).to.be.ok
		});
	})
})
