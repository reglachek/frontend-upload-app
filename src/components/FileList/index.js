import React from 'react'
import CircularProgressBar from 'react-circular-progressbar'
import { MdCheckCircle, MdError, MdLink } from 'react-icons/md'

import { Container, FileInfo, Preview } from './style'

const FileList = ({ files, onDelete }) => (
    <Container>
        {files.map(uploadedFiles => (
            <li key={uploadedFiles.id}>
                <FileInfo>
                    <Preview src={uploadedFiles.preview} />
                    <div>
                        <strong>{uploadedFiles.name}</strong>
                        <span>{uploadedFiles.readableSize} {!!uploadedFiles.url && (
                            <button onClick={() => onDelete(uploadedFiles.id)}>Excluir</button>
                        )}</span>
                    </div>
                </FileInfo>
                
                <div>
                    {/* Caso não tenha terminado o upload e não tenha erro mostra a barra de progresso */}
                    {!uploadedFiles.uploaded && !uploadedFiles.error && (
                        <CircularProgressBar
                            styles={{
                                root: { width:24 },
                                path: { stroke: '#7159c1'}
                            }}
                            strokeWidth={10}
                            percentage={uploadedFiles.progress}
                        />
                    )}

                    {/* Só mostra o link se a imagem tiver uma URL */}
                    {uploadedFiles.url && (
                        <a href={uploadedFiles.url} target='_blank' rel='noopener noreferrer'>
                            <MdLink style={{ marginRight: 8 }} size={24} color='#222' />
                        </a>
                    )}
                    
                    {/* Só mostra ó icone de check caso tenha terminado o upload */}
                    {uploadedFiles.uploaded && <MdCheckCircle size={24} color='#78e5d5' />}
                    
                    {/* Só mostra o icone de error caso tenha algum erro */}
                    {uploadedFiles.error && <MdError size={24} color='#e57878' />}
                </div>
            </li>
        ))}
    </Container>
)

export default FileList
