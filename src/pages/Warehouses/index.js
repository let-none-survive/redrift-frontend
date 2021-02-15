import React, { useCallback, useState, useContext, useMemo } from 'react'
import { useQuery, useMutation } from 'react-query'
import { BASE_URL } from '../../../config/enviroment'
import Modal from '../../components/Modal'
import { ReactQueryContext } from '../../context/ReactQueryContext'
import axios from 'axios'
import AsyncSelect from 'react-select/async'

const prepareOptions = raw_data => {
  return raw_data.map(i => ({
    label: i.name,
    value: i.id,
    metafield: i.unDistributedAmount,
  }))
}

const DEFAULT_WAREHOUSE = {
  name: '',
  productions: [],
}

const Warehouses = () => {
  const { client } = useContext(ReactQueryContext)
  const [isEdit, setIsEdit] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showDistributeMenu, setShowDistributeMenu] = useState(false)
  const [isMove, setIsMove] = useState(false)
  const [productionsToMove, setProductionsToMove] = useState([])
  const [warehouse, setWarehouse] = useState(DEFAULT_WAREHOUSE)
  const [isDelete, setIsDelete] = useState(false)

  const handleModalClose = () => {
    toggleModal()
    setWarehouse(DEFAULT_WAREHOUSE)
    setProductionsToMove([])
    setShowDistributeMenu(false)
    setIsEdit(false)
    setIsDelete(false)
    setIsMove(false)
  }

  const { data, isLoading: warehousesLoaded } = useQuery('warehouses', () => {
    return fetch(BASE_URL + '/warehouses').then(res => res.json())
  })

  const createMutation = useMutation(
    data => {
      return axios.post(BASE_URL + '/warehouses', data)
    },
    {
      onMutate: () => {
        setIsLoading(true)
      },
      onError: () => {
        setIsLoading(false)
      },
      onSuccess: () => {
        // Invalidate and refetch
        setIsLoading(false)
        setIsModalOpen(false)
        return client.invalidateQueries('warehouses')
      },
    }
  )

  const updateMutation = useMutation(
    data => {
      return axios.put(BASE_URL + '/warehouses/' + data.id, data)
    },
    {
      onMutate: () => {
        setIsLoading(true)
      },
      onError: () => {
        setIsLoading(false)
      },
      onSuccess: () => {
        // Invalidate and refetch
        setIsLoading(false)
        setIsModalOpen(false)
        return client.invalidateQueries('warehouses')
      },
    }
  )

  const deleteMutation = useMutation(
    data => {
      return axios.post(BASE_URL + '/warehouses/' + data.id, data)
    },
    {
      onMutate: () => {
        setIsLoading(true)
      },
      onError: () => {
        setIsLoading(false)
      },
      onSuccess: () => {
        // Invalidate and refetch
        setIsLoading(false)
        setIsModalOpen(false)
        return client.invalidateQueries('warehouses')
      },
    }
  )

  const moveMutation = useMutation(
    data => {
      return axios.post(BASE_URL + '/warehouses/' + data.id + '/move', data)
    },
    {
      onMutate: () => {
        setIsLoading(true)
      },
      onError: () => {
        setIsLoading(false)
      },
      onSuccess: () => {
        // Invalidate and refetch
        setIsLoading(false)
        setIsModalOpen(false)
        return client.invalidateQueries('warehouses')
      },
    }
  )

  const toggleModal = useCallback(() => {
    setIsModalOpen(!isModalOpen)
  }, [isModalOpen])

  const handleChange = useCallback(
    e => {
      setWarehouse({
        ...warehouse,
        [e.target.name]: e.target.value,
      })
    },
    [warehouse]
  )

  const handleSearchProductions = async (input, cb) => {
    const productions = await fetch(
      BASE_URL + '/productions?q=' + input
    ).then(r => r.json())
    cb(prepareOptions(productions))
  }

  const handleSearchWarehouses = async (input, cb) => {
    const warehouses = await fetch(
      BASE_URL + '/warehouses?q=' + input
    ).then(r => r.json())
    cb(prepareOptions(warehouses))
  }

  const handleSelectChange = useCallback(
    async e => {
      // const production = await fetch(BASE_URL + '/productions/' + e.value).then(r => r.json())
      setWarehouse({
        ...warehouse,
        productions: [
          ...warehouse.productions,
          {
            production_id: e.value,
            amount: 0,
            production_name: e.label,
            unDistributedAmount: e.metafield,
          },
        ],
      })
      setShowDistributeMenu(false)
    },
    [warehouse]
  )

  const handleMoveSelectChange = (e, p) => {
    setProductionsToMove([
      ...productionsToMove,
      {
        warehouse_id: e.value,
        amount: 0,
        production_id: p.production_id,
        warehouse_name: e.label,
      },
    ])
  }

  const handleDistributedAmountChange = (e, p) => {
    const productionsIndex = warehouse.productions.findIndex(
      i => i.production_id === p.production_id
    )
    const newProductions = [...warehouse.productions]
    newProductions[productionsIndex] = {
      ...warehouse.productions[productionsIndex],
      production_id: p.production_id,
      amount: +e.target.value,
    }
    setWarehouse({
      ...warehouse,
      productions: newProductions,
    })
  }

  const handleEdit = async id => {
    const warehouse = await fetch(BASE_URL + '/warehouses/' + id).then(res =>
      res.json()
    )
    setWarehouse(warehouse)
    setIsEdit(true)
    toggleModal()
  }

  const handleMove = async id => {
    const warehouse = await fetch(BASE_URL + '/warehouses/' + id).then(res =>
      res.json()
    )
    setWarehouse(warehouse)
    setIsMove(true)
    toggleModal()
  }

  const handleWarehouse = useCallback(() => {
    if (isMove && !isDelete) {
      const preparedMoveTo = productionsToMove.map(
        ({ warehouse_id, production_id, amount }) => {
          return {
            warehouse_id,
            production_id,
            amount,
          }
        }
      )
      moveMutation.mutate({ ...warehouse, moveTo: preparedMoveTo })
      return
    }
    if (isDelete) {
      const preparedMoveTo = productionsToMove.map(
        ({ warehouse_id, production_id, amount }) => {
          return {
            warehouse_id,
            production_id,
            amount,
          }
        }
      )
      deleteMutation.mutate({ ...warehouse, moveTo: preparedMoveTo })
      return
    }
    isEdit ? updateMutation.mutate(warehouse) : createMutation.mutate(warehouse)
  }, [warehouse, isEdit, isDelete, productionsToMove])

  const handleDelete = async id => {
    const warehouse = await fetch(BASE_URL + '/warehouses/' + id).then(res =>
      res.json()
    )
    setWarehouse(warehouse)
    console.log(warehouse)
    if (!warehouse.productions.length) {
      return deleteMutation.mutate(warehouse)
    }
    setIsDelete(true)
    toggleModal()
  }

  const handleAmountToMove = (e, index) => {
    const raw = [...productionsToMove]
    raw[index].amount = +e.target.value
    setProductionsToMove(raw)
  }

  return (
    <section className="section">
      <div className="container">
        <div className="title has-text-centered">
          Warehouses
          <button onClick={toggleModal} className="button is-success ml-2">
            <span className="icon is-small">
              <i className="fas fa-plus" />
            </span>
          </button>
        </div>
        <table className="table is-full-width">
          <thead>
            <th>
              <abbr title="Position">Pos</abbr>
            </th>
            <th>Name</th>
            <th>Productions amount</th>
            <th />
          </thead>
          <tfoot>
            <th>
              <abbr title="Position">Pos</abbr>
            </th>
            <th>Name</th>
            <th>Productions amount</th>
            <th />
          </tfoot>
          <tbody>
            {warehousesLoaded ? (
              <span>Loading...</span>
            ) : (
              <>
                {data.map(warehouse => {
                  return (
                    <tr key={warehouse.id}>
                      <td>{warehouse.id}</td>
                      <td>{warehouse.name}</td>
                      <td>{warehouse.productions_amount}</td>
                      <td className="is-actions-cell">
                        <div className="buttons is-right">
                          <button
                            onClick={() => handleEdit(warehouse.id)}
                            className="button is-small is-primary"
                            type="button"
                          >
                            <span className="icon">
                              <i className="fa fa-pen" />
                            </span>
                          </button>
                          <button
                            onClick={() => handleDelete(warehouse.id)}
                            className="button is-small is-danger jb-modal"
                            data-target="sample-modal"
                            type="button"
                          >
                            <span className="icon">
                              <i className="fa fa-trash" />
                            </span>
                          </button>
                          <button
                            onClick={() => handleMove(warehouse.id)}
                            className="button is-small is-info jb-modal"
                            data-target="sample-modal"
                            type="button"
                          >
                            <span className="icon">
                              <i className="fa fa-arrows-alt-h" />
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </>
            )}
          </tbody>
        </table>
        <Modal
          isDelete={isDelete}
          onSave={handleWarehouse}
          onClose={handleModalClose}
          isOpen={isModalOpen}
          isLoading={isLoading}
        >
          {!isDelete && !isMove ? (
            <>
              <form>
                <div className="columns">
                  <div className="column">
                    <div className="field">
                      <label className="label">Name</label>
                      <div className="control">
                        <input
                          name="name"
                          value={warehouse.name}
                          onChange={handleChange}
                          className="input"
                          type="text"
                          placeholder="warehouse name"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                {warehouse.productions.map(p => (
                  <div key={p.production_name} className="columns">
                    <div className="column is-8">
                      <div className="field">
                        <label className="label">Production name</label>
                        <div className="control">
                          <input
                            name="productionname"
                            value={`${p.production_name} ${
                              p.unDistributedAmount === null
                                ? ''
                                : `(${p.unDistributedAmount} allowed)`
                            }`}
                            disabled
                            className="input disabled"
                            type="text"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="column">
                      <div className="field">
                        <label className="label">Amount to distribute</label>
                        <div className="control">
                          <input
                            name="amount"
                            onChange={e => handleDistributedAmountChange(e, p)}
                            min={0}
                            max={p.unDistributedAmount}
                            defaultValue={p.amount}
                            className="input"
                            type="number"
                            placeholder="Amount"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </form>
              {showDistributeMenu ? (
                <div className="mt-2">
                  <AsyncSelect
                    onChange={handleSelectChange}
                    cacheOptions
                    loadOptions={handleSearchProductions}
                  />
                </div>
              ) : (
                <button
                  onClick={() => setShowDistributeMenu(true)}
                  className="button is-link is-outlined mt-2"
                >
                  Add production
                </button>
              )}
            </>
          ) : (
            <div>
              {!isMove && (
                <>
                  <div>
                    {warehouse.name} contains{' '}
                    {warehouse.productions.reduce(
                      (acc, val) => acc + val.amount,
                      0
                    )}{' '}
                    productions.
                  </div>
                  <button
                    onClick={() => setIsMove(true)}
                    className="button is-info is-outlined mt-2"
                  >
                    Move products
                  </button>
                </>
              )}
              {isMove &&
                warehouse.productions.map((p, index) => (
                  <div key={p.production_id} className="columns">
                    <div className="column">
                      <div className="columns">
                        <div className="column is-5">
                          <div className="field">
                            <label className="label">name</label>
                            <div className="control">
                              <input
                                name="productionname"
                                value={`${p.production_name} ${
                                  p.unDistributedAmount === null
                                    ? ''
                                    : `(${p.unDistributedAmount} allowed)`
                                }`}
                                disabled
                                className="input disabled"
                                type="text"
                              />
                            </div>
                          </div>
                        </div>
                        <div className="column">
                          <div className="field">
                            <label className="label">amount</label>
                            <div className="control">
                              <input
                                name="amount"
                                value={p.amount}
                                disabled
                                className="input disabled"
                                type="number"
                                placeholder="Amount"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="column">
                      {productionsToMove.length &&
                      productionsToMove.findIndex(
                        i => i.production_id === p.production_id
                      ) === index ? (
                        <div>
                          <div className="columns">
                            <div className="column is-5">
                              <div className="field">
                                <label className="label">name</label>
                                <div className="control">
                                  <input
                                    name="productionname"
                                    value={
                                      productionsToMove[index].warehouse_name
                                    }
                                    disabled
                                    className="input disabled"
                                    type="text"
                                  />
                                </div>
                              </div>
                            </div>
                            <div className="column">
                              <div className="field">
                                <label className="label">amount</label>
                                <div className="control">
                                  <input
                                    name="amount"
                                    value={productionsToMove[index].amount}
                                    onChange={e => handleAmountToMove(e, index)}
                                    className="input"
                                    type="number"
                                    placeholder="Amount"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <AsyncSelect
                          onChange={e => handleMoveSelectChange(e, p)}
                          cacheOptions
                          loadOptions={handleSearchWarehouses}
                        />
                      )}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </Modal>
      </div>
    </section>
  )
}

export default Warehouses
