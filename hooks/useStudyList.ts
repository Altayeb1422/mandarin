import { useState, useEffect, useCallback } from 'react';
import { StudyItem } from '../types';

const STORAGE_KEY = 'studyList_zh';

export const useStudyList = () => {
    const [studyList, setStudyList] = useState<StudyItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        try {
            const items = localStorage.getItem(STORAGE_KEY);
            if (items) {
                setStudyList(JSON.parse(items));
            }
        } catch (error) {
            console.error("从本地存储加载学习列表失败", error);
        } finally {
            setLoading(false);
        }
    }, []);

    const saveToLocalStorage = (items: StudyItem[]) => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
        } catch (error) {
            console.error("保存学习列表到本地存储失败", error);
        }
    };

    const addStudyItem = useCallback((biaoda: string, jieshi: string) => {
        setStudyList(prevList => {
            const isDuplicate = prevList.some(item => item.biaoda.toLowerCase() === biaoda.toLowerCase());
            if (isDuplicate) {
                return prevList;
            }
            const newItem: StudyItem = {
                id: new Date().toISOString(),
                biaoda,
                jieshi,
                createdAt: new Date().toISOString(),
            };
            const updatedList = [newItem, ...prevList];
            saveToLocalStorage(updatedList);
            return updatedList;
        });
    }, []);
    
    const isExpressionInList = useCallback((biaoda: string): boolean => {
        return studyList.some(item => item.biaoda.toLowerCase() === biaoda.toLowerCase());
    }, [studyList]);

    const removeStudyItem = useCallback((id: string) => {
        setStudyList(prevList => {
            const updatedList = prevList.filter(item => item.id !== id);
            saveToLocalStorage(updatedList);
            return updatedList;
        });
    }, []);

    return { studyList, addStudyItem, removeStudyItem, isExpressionInList, loading };
};