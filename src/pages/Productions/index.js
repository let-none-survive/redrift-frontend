import React, { useCallback, useState, useContext, useMemo } from 'react'
import { useQuery, useMutation } from 'react-query'
import { BASE_URL } from '../../../config/enviroment'
import Modal from '../../components/Modal'
import { ReactQueryContext } from '../../context/ReactQueryContext'
import axios from 'axios'
import AsyncSelect from 'react-select/async';

const prepareOptions = raw_data => {
  return raw_data.map(i => ({
    label: i.name,
    value: i.id,
  }))
}

const DEFAULT_PRODUCTION = {
  name: '',
  amount: 0,
  applyTo: []
}

const Productions = () => {
  const { client } = useContext(ReactQueryContext)
  const [isEdit, setIsEdit] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showDistributeMenu, setShowDistributeMenu] = useState(false)
  const [production, setProduction] = useState(DEFAULT_PRODUCTION)

  const handleModalClose = () => {
    setIsEdit(false)
    setShowDistributeMenu(false)
    setProduction(DEFAULT_PRODUCTION)
    toggleModal()
  }

  const allowedAmountToDistribute = useMemo(() => {
    if (!production.applyTo.length) {
      return production.amount;
    }
    const used = production.applyTo.reduce((acc, val) => acc + +val.amount, 0)
    return production.amount - used;
  }, [production])

  const { data, isLoading: productionsLoaded } = useQuery('productions', () => {
    return fetch(BASE_URL + '/productions').then(res => res.json())
  })
  // todo create mutation.js and move it there.
  const createMutation = useMutation((data) => {
    return axios.post(BASE_URL + '/productions', data)
  }, {
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
      return client.invalidateQueries('productions')
    }
  })

  const editMutation = useMutation((data) => {
    return axios.put(BASE_URL + '/productions/' + data.id, data)
  }, {
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
      return client.invalidateQueries('productions')
    }
  })

  const removeMutation = useMutation((id) => {
    return axios.delete(BASE_URL + '/productions/' + id)
  }, {
    onMutate: () => {
      setIsLoading(true)
    },
    onError: () => {
      setIsLoading(false)
    },
    onSuccess: () => {
      // todo use https://www.npmjs.com/package/react-notifications instead alert
      alert('Productions has been removed from all warehouses')
      setIsLoading(false)
      setIsModalOpen(false)
      // Invalidate and refetch
      return client.invalidateQueries('productions')
    }
  })

  const handleProduction = useCallback(() => {
    isEdit ? editMutation.mutate(production) :
      createMutation.mutate(production)
  }, [production])

  const handleChange = useCallback((e) => {
    setProduction({
      ...production,
      [e.target.name]: e.target.value
    })
  }, [production])

  const toggleModal = useCallback(() => {
    setIsModalOpen(!isModalOpen)
  }, [isModalOpen])

  const handleSearchWarehouses = async (input, cb) => {
    const warehouses = await fetch(BASE_URL + '/warehouses?q=' + input).then(r => r.json())
    cb(prepareOptions(warehouses))
  }

  const handleDistributedAmountChange = (e, p) => {
    const applyToIndex = production.applyTo.findIndex(i => i.warehouse_id === p.warehouse_id)
    const newApplyTo = [...production.applyTo]
    newApplyTo[applyToIndex] = {
      warehouse_id: p.warehouse_id,
      amount: +e.target.value
    }
    setProduction({
      ...production,
      applyTo: newApplyTo
    })

  }
  const handleSelectChange = useCallback(e => {
    setProduction({
      ...production,
      applyTo: [
        ...production.applyTo,
        {
          warehouse_id: e.value,
          amount: 0,
          warehouse_name: e.label
        }
      ]
    })
    setShowDistributeMenu(false)
  }, [production])

  const removeProducion = ({id}) => {
    removeMutation.mutate(id)
  }

  const handleEdit = async id => {
    const production = await fetch(BASE_URL + '/productions/' + id).then(r => r.json())
    setProduction(production)
    setIsEdit(true)
    toggleModal()
  }

  // todo make table component
  return (
    <section className="section">
      <div className="container">
        <div className="title has-text-centered">
          Productions
          <button onClick={toggleModal} className="button is-success ml-2">
            <span className="icon is-small">
              <i className="fas fa-plus" />
            </span>
          </button>
        </div>
        <table className="table is-full-width">
          <thead>
            <th><abbr title="Position">Pos</abbr></th>
            <th>Name</th>
            <th>Distributed amount</th>
            <th>Undistributed amount</th>
            <th>Total amount</th>
            <th />
          </thead>
          <tfoot>
            <th><abbr title="Position">Pos</abbr></th>
            <th>Name</th>
            <th>Distributed amount</th>
            <th>Undistributed amount</th>
            <th>Total amount</th>
            <th />
          </tfoot>
          <tbody>
            {productionsLoaded ? (
              <span>Loading...</span>
            ) : (
                <>
                  {data.map(production => {
                    return (
                      <tr key={production.id}>
                        <td>{production.id}</td>
                        <td>{production.name}</td>
                        <td>{production.distributedAmount}</td>
                        <td>{production.unDistributedAmount}</td>
                        <td>{production.amount}</td>
                        <td className="is-actions-cell">
                          <div className="buttons is-right">
                            <button onClick={() => handleEdit(production.id)} className="button is-small is-primary" type="button">
                              <span className="icon"><i className="fa fa-pen" /></span>
                            </button>
                            <button onClick={() => removeProducion(production)} className="button is-small is-danger jb-modal" data-target="sample-modal" type="button">
                              <span className="icon"><i className="fa fa-trash" /></span>
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

        <Modal onSave={handleProduction} onClose={handleModalClose} isOpen={isModalOpen} isLoading={isLoading}>
          <form>
            <div className="columns">
              <div className="column is-8">
                <div className="field">
                  <label className="label">Name</label>
                  <div className="control">
                    <input name='name' value={production.name} onChange={handleChange} className="input" type="text" placeholder="production name" />
                  </div>
                </div>
              </div>
              <div className="column">
                <div className="field">
                  <label className="label">Amount ({allowedAmountToDistribute})</label>
                  <div className="control">
                    <input name='amount' value={production.amount} onChange={handleChange} className="input" />
                  </div>
                </div>
              </div>
            </div>
            {production.applyTo.map(p => {
              return (
                <div key={p.warehouse_id} className="columns">
                  <div className="column is-8">
                    <div className="field">
                      <label className="label">Warehouse name</label>
                      <div className="control">
                        <input name='warehousename' value={p.warehouse_name} disabled className="input disabled" type="text" />
                      </div>
                    </div>
                  </div>
                  <div className="column">
                    <div className="field">
                      <label className="label">Amount to distribute</label>
                      <div className="control">
                        <input name='amount' onChange={e => handleDistributedAmountChange(e, p)} min={0} max={allowedAmountToDistribute} defaultValue={p.amount} className="input" type="number" placeholder='Amount' />
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </form>
          {!showDistributeMenu && production.amount > 0 && (
            <button onClick={() => setShowDistributeMenu(true)} className="button is-link is-outlined mt-2">Distribute</button>
          )}
          {showDistributeMenu && (
            <div className='mt-2'>
              <AsyncSelect onChange={handleSelectChange} cacheOptions loadOptions={handleSearchWarehouses} />
            </div>
          )}
        </Modal>
      </div>
    </section>
  )
}

export default Productions
