import React, { useState, useRef, useEffect } from 'react'
import { Calendar, Download, Camera } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'

const GDayPlanner = () => {
    const [draggedItem, setDraggedItem] = useState(null)
    const [droppedItems, setDroppedItems] = useState({})
    const [draggedFromDate, setDraggedFromDate] = useState(null)
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
    const [showYearPicker, setShowYearPicker] = useState(false)
    const [showMonthPicker, setShowMonthPicker] = useState(false)
    const [touchedItem, setTouchedItem] = useState(null)
    const [dragPreview, setDragPreview] = useState({ visible: false, x: 0, y: 0 })
    const plannerRef = useRef(null)

    // Leave types with colors
    const leaveTypes = [
        { id: 'example', label: '例', color: 'leave-red', description: '例假' },
        { id: 'rest', label: '休', color: 'leave-blue', description: '休假' },
        { id: 'annual', label: 'A/L', color: 'leave-green', description: '年假' },
        { id: 'welfare', label: '福補', color: 'leave-purple', description: '福利補休' },
        { id: 'medical', label: '體檢', color: 'leave-yellow', description: '體檢' },
        { id: 'sick', label: 'S/L', color: 'leave-orange', description: '病假' },
        { id: 'personal', label: 'P/L', color: 'leave-pink', description: '事假' }
    ]

    const monthNames = [
        '1月', '2月', '3月', '4月', '5月', '6月',
        '7月', '8月', '9月', '10月', '11月', '12月'
    ]

    const dayNames = ['日', '一', '二', '三', '四', '五', '六']

    // Get calendar data
    const getCalendarData = () => {
        const firstDay = new Date(currentYear, currentMonth, 1)
        const lastDay = new Date(currentYear, currentMonth + 1, 0)
        const daysInMonth = lastDay.getDate()
        const startDayOfWeek = firstDay.getDay()

        // Generate calendar days
        const calendarDays = []
        
        // Add empty cells for days before month starts
        for (let i = 0; i < startDayOfWeek; i++) {
            calendarDays.push(null)
        }
        
        // Add days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            calendarDays.push(day)
        }

        // Calculate total cells needed (6 rows x 7 columns = 42)
        while (calendarDays.length < 42) {
            calendarDays.push(null)
        }

        return {
            calendarDays,
            startDayOfWeek,
            daysInMonth
        }
    }

    const { calendarDays, startDayOfWeek } = getCalendarData()

    // Year picker functions
    const handleYearClick = () => {
        setShowYearPicker(!showYearPicker)
        setShowMonthPicker(false)
    }

    const selectYear = (year) => {
        setCurrentYear(year)
        setShowYearPicker(false)
    }

    // Month picker functions
    const handleMonthClick = () => {
        setShowMonthPicker(!showMonthPicker)
        setShowYearPicker(false)
    }

    const selectMonth = (monthIndex) => {
        setCurrentMonth(monthIndex)
        setShowMonthPicker(false)
    }

    // Generate year options (current year ± 5 years)
    const getYearOptions = () => {
        const currentYearDefault = new Date().getFullYear()
        const startYear = currentYearDefault - 5
        const endYear = currentYearDefault + 5
        const years = []
        for (let i = startYear; i <= endYear; i++) {
            years.push(i)
        }
        return years
    }

    // Mobile touch event handlers
    const handleTouchStart = (e, leaveType, fromDate = null) => {
        setTouchedItem({ leaveType, fromDate })
        setDraggedItem(leaveType)
        setDraggedFromDate(fromDate)
        
        const touch = e.touches[0]
        setDragPreview({
            visible: true,
            x: touch.clientX,
            y: touch.clientY
        })
        
        // Prevent default to avoid scrolling
        e.preventDefault()
    }

    const handleTouchMove = (e) => {
        if (!touchedItem) return
        
        const touch = e.touches[0]
        setDragPreview({
            visible: true,
            x: touch.clientX,
            y: touch.clientY
        })
        
        e.preventDefault()
    }

    const handleTouchEnd = (e) => {
        if (!touchedItem) return
        
        // Find the element at the touch position
        const touch = e.changedTouches[0]
        const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY)
        
        // Find the calendar cell
        const calendarCell = elementBelow?.closest('.calendar-cell')
        if (calendarCell) {
            const day = parseInt(calendarCell.dataset.day)
            if (day) {
                handleDropAction(day)
            } else {
                // Dropped outside calendar - remove item
                handleEmptyDropAction()
            }
        } else {
            // Dropped outside calendar - remove item
            handleEmptyDropAction()
        }
        
        // Reset touch state
        setTouchedItem(null)
        setDragPreview({ visible: false, x: 0, y: 0 })
        setDraggedItem(null)
        setDraggedFromDate(null)
    }

    // Regular drag handlers for leave types (from top section)
    const handleDragStart = (e, leaveType) => {
        setDraggedItem(leaveType)
        setDraggedFromDate(null)
        e.dataTransfer.effectAllowed = 'copy'
    }

    // Regular drag handlers for dropped leaves (from calendar)
    const handleLeaveDragStart = (e, leaveType, dateKey) => {
        setDraggedItem(leaveType)
        setDraggedFromDate(dateKey)
        e.dataTransfer.effectAllowed = 'move'
        e.stopPropagation()
    }

    const handleDragOver = (e) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = draggedFromDate ? 'move' : 'copy'
    }

    const handleDrop = (e, day) => {
        e.preventDefault()
        handleDropAction(day)
    }

    // Common drop logic
    const handleDropAction = (day) => {
        if (draggedItem && day) {
            const key = `${currentYear}-${currentMonth}-${day}`
            
            // If dragging from another date, remove from old location
            if (draggedFromDate) {
                setDroppedItems(prev => {
                    const newItems = { ...prev }
                    delete newItems[draggedFromDate]
                    newItems[key] = draggedItem
                    return newItems
                })
            } else {
                // Add new item
                setDroppedItems(prev => ({
                    ...prev,
                    [key]: draggedItem
                }))
            }
        }
        setDraggedItem(null)
        setDraggedFromDate(null)
    }

    // Handle drop on empty area (outside calendar)
    const handleEmptyAreaDrop = (e) => {
        e.preventDefault()
        handleEmptyDropAction()
    }

    const handleEmptyDropAction = () => {
        if (draggedFromDate) {
            // Remove item if dragged from calendar to empty area
            setDroppedItems(prev => {
                const newItems = { ...prev }
                delete newItems[draggedFromDate]
                return newItems
            })
        }
        setDraggedItem(null)
        setDraggedFromDate(null)
    }

    // Validation functions
    const validateLeaveRules = () => {
        const currentYearKey = currentYear.toString()
        const errors = []

        // Count 體檢 and 福補 for the current year
        let medicalCount = 0
        let welfareCount = 0
        
        Object.entries(droppedItems).forEach(([dateKey, leaveType]) => {
            if (dateKey.startsWith(currentYearKey)) {
                if (leaveType.id === 'medical') medicalCount++
                if (leaveType.id === 'welfare') welfareCount++
            }
        })

        // Check 體檢 limit (max 1 per year)
        if (medicalCount > 1) {
            errors.push(`體檢每年最多只能請一天，目前已安排 ${medicalCount} 天`)
        }

        // Check 福補 limit (max 7 per year)
        if (welfareCount > 7) {
            errors.push(`福補每年最多只能請七天，目前已安排 ${welfareCount} 天`)
        }

        return errors
    }

    // Screenshot generation with validation
    const generateScreenshot = async () => {
        if (!plannerRef.current) return

        // Validate before generating screenshot
        const errors = validateLeaveRules()
        
        if (errors.length > 0) {
            errors.forEach(error => {
                toast.error(error, {
                    duration: 5000,
                    position: 'top-center'
                })
            })
            return
        }

        try {
            // Load html2canvas from CDN
            if (!window.html2canvas) {
                const script = document.createElement('script')
                script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'
                document.head.appendChild(script)
                await new Promise((resolve) => {
                    script.onload = resolve
                })
            }

            const canvas = await window.html2canvas(plannerRef.current, {
                scale: 2,
                backgroundColor: '#ffffff',
                useCORS: true,
                allowTaint: true
            })
            
            // Create download link
            const link = document.createElement('a')
            link.download = `vacation-planner-${currentYear}-${currentMonth + 1}.png`
            link.href = canvas.toDataURL('image/png')
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)

            // Show success message
            toast.success('截圖已成功儲存！', {
                duration: 3000,
                position: 'top-center'
            })
        } catch (error) {
            console.error('Error generating screenshot:', error)
            toast.error('截圖產生失敗，請重試', {
                duration: 3000,
                position: 'top-center'
            })
        }
    }

    return (
        <div 
            className="planner-container"
            onDragOver={handleDragOver}
            onDrop={handleEmptyAreaDrop}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            <Toaster />
            
            {/* Mobile Drag Preview */}
            {dragPreview.visible && touchedItem && (
                <div
                    className="mobile-drag-preview"
                    style={{
                        position: 'fixed',
                        left: dragPreview.x - 30,
                        top: dragPreview.y - 30,
                        pointerEvents: 'none',
                        zIndex: 9999
                    }}
                >
                    <div className={`leave-type-item ${touchedItem.leaveType.color}`}>
                        {touchedItem.leaveType.label}
                    </div>
                </div>
            )}
            
            <div ref={plannerRef} className="planner-content">
                {/* Header */}
                <div className="planner-header">
                    <h1 className="planner-title">G-Day 假期規劃表</h1>
                    <div className="navigation-container">
                        <div className="date-picker-container">
                            <span 
                                className="clickable-date"
                                onClick={handleYearClick}
                                title="點擊選擇年份"
                            >
                                {currentYear}年
                            </span>
                            {showYearPicker && (
                                <div className="picker-dropdown year-picker">
                                    {getYearOptions().map(year => (
                                        <div
                                            key={year}
                                            className={`picker-option ${year === currentYear ? 'selected' : ''}`}
                                            onClick={() => selectYear(year)}
                                        >
                                            {year}年
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="date-picker-container">
                            <span 
                                className="clickable-date"
                                onClick={handleMonthClick}
                                title="點擊選擇月份"
                            >
                                {monthNames[currentMonth]}
                            </span>
                            {showMonthPicker && (
                                <div className="picker-dropdown month-picker">
                                    {monthNames.map((month, index) => (
                                        <div
                                            key={index}
                                            className={`picker-option ${index === currentMonth ? 'selected' : ''}`}
                                            onClick={() => selectMonth(index)}
                                        >
                                            {month}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Leave Types */}
                <div className="leave-types-section">
                    <h3 className="leave-types-title">假期類型</h3>
                    <div className="leave-types-grid">
                        {leaveTypes.map((leaveType) => (
                            <div
                                key={leaveType.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, leaveType)}
                                onTouchStart={(e) => handleTouchStart(e, leaveType)}
                                className={`leave-type-item ${leaveType.color}`}
                                title={leaveType.description}
                            >
                                <span className="leave-type-label">{leaveType.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Calendar */}
                <div className="calendar-container">
                    {/* Calendar Header */}
                    <div className="calendar-header">
                        {dayNames.map((day) => (
                            <div key={day} className="calendar-day-name">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar Body */}
                    <div className="calendar-grid">
                        {calendarDays.map((day, index) => {
                            if (!day) {
                                return <div key={index} className="calendar-empty-cell"></div>
                            }

                            const key = `${currentYear}-${currentMonth}-${day}`
                            const droppedLeave = droppedItems[key]
                            const dayOfWeek = (startDayOfWeek + day - 1) % 7
                            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

                            return (
                                <div
                                    key={`${index}-${day}`}
                                    data-day={day}
                                    onDragOver={handleDragOver}
                                    onDrop={(e) => handleDrop(e, day)}
                                    className={`calendar-cell ${isWeekend ? 'weekend' : ''}`}
                                >
                                    <div className="calendar-day-number">{day}</div>
                                    {droppedLeave && (
                                        <div 
                                            className={`dropped-leave ${droppedLeave.color}`}
                                            draggable
                                            onDragStart={(e) => handleLeaveDragStart(e, droppedLeave, key)}
                                            onTouchStart={(e) => handleTouchStart(e, droppedLeave, key)}
                                            title="拖拉到空白處可刪除"
                                        >
                                            {droppedLeave.label}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Instructions */}
                <div className="instructions">
                    <p className="instruction-text">
                        <Calendar className="instruction-icon" />
                        把假期類型拉到對指定日期上進行規劃
                    </p>
                    <p className="instruction-note">拉已安排的假期到空白處可刪除</p>
                    <p className="instruction-note">點選年份或月份可快速切換</p>
                </div>
            </div>

            {/* Screenshot Button */}
            <div className="screenshot-section">
                <button
                    onClick={generateScreenshot}
                    className="screenshot-button"
                >
                    <Camera className="screenshot-icon" />
                    截圖 SAVE
                </button>
            </div>
        </div>
    )
}

export default GDayPlanner