import React from 'react'
import { useDrag, useDrop } from 'react-dnd'
import { getEventColor, getContrastColor } from '../utils/eventUtils'

const ItemTypes = {
  EVENT: 'event'
}

const DraggableEvent = ({ event, onEdit, onDrop }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.EVENT,
    item: { id: event.id, event },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    end: (item, monitor) => {
      const dropResult = monitor.getDropResult()
      if (item && dropResult && dropResult.date) {
        onDrop(item.id, dropResult.date)
      }
    },
  }), [event.id, onDrop])

  const [, drop] = useDrop(() => ({
    accept: ItemTypes.EVENT,
    drop: (item, monitor) => {
      return { handled: true }
    },
  }))

  const eventColor = getEventColor(event.category)
  const textColor = getContrastColor(eventColor)

  const handleClick = (e) => {
    e.stopPropagation()
    if (!isDragging) {
      onEdit(event)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      e.stopPropagation()
      onEdit(event)
    }
  }

  return (
    <div
      ref={(node) => drag(drop(node))}
      className={`event-chip ${isDragging ? 'dragging' : ''}`}
      style={{ 
        backgroundColor: eventColor,
        color: textColor,
        opacity: isDragging ? 0.5 : 1,
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      title={`${event.title} (${event.startTime} - ${event.endTime})`}
      tabIndex={0}
      role="button"
      aria-label={`Event: ${event.title}`}
    >
      <span className="event-title">{event.title}</span>
      <div className="event-indicators">
        {event.recurring && <span className="recurring-icon">🔁</span>}
        {isDragging && <span className="drag-icon">📋</span>}
      </div>
    </div>
  )
}

export const DroppableCalendarDay = ({ children, date }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemTypes.EVENT,
    drop: () => ({ date }),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }))

  return (
    <div 
      ref={drop}
      className={isOver ? 'drop-target-hover' : ''}
    >
      {children}
    </div>
  )
}

export default DraggableEvent
